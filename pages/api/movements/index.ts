import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/auth/permissions';
import { Prisma } from '@prisma/client';

/**
 * @openapi
 * /api/movements:
 *   get:
 *     summary: List financial movements
 *     description: Returns a paginated list of movements. Supports filtering by date and search.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: global
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of movements
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Create a new movement
 *     description: Creates a new income or expense movement for the current user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               concept:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Movement created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as unknown as HeadersInit),
    });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      if (!(await hasPermission(session.user.id, 'movements:view'))) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const {
        page = '1',
        pageSize = '10',
        search = '',
        from,
        to,
        all = 'false',
        global = 'false',
      } = req.query;

      const isAll = all === 'true';
      const isGlobal = global === 'true';

      // Security check: Only ADMIN can see global data
      const effectiveUserId =
        isGlobal && (await hasPermission(session.user.id, 'users:view'))
          ? null
          : session.user.id;

      const p = parseInt(page as string);
      const ps = parseInt(pageSize as string);
      const skip = isAll ? undefined : (p - 1) * ps;
      const take = isAll ? undefined : ps;

      // Build filters
      const where: Prisma.MovementWhereInput = {};

      if (effectiveUserId) {
        where.userId = effectiveUserId;
      }

      if (search) {
        where.OR = [
          { concept: { contains: search as string, mode: 'insensitive' } },
          { type: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // Prepare dates for queries
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setUTCHours(0, 0, 0, 0);
      const endOfToday = new Date(now);
      endOfToday.setUTCHours(23, 59, 59, 999);

      if (from || to) {
        where.date = {};
        if (from) {
          const fromDate = new Date(from as string);
          fromDate.setUTCHours(0, 0, 0, 0);
          where.date.gte = fromDate;
        }
        if (to) {
          const toDate = new Date(to as string);
          toDate.setUTCHours(23, 59, 59, 999);
          where.date.lte = toDate;
        }
      }

      // Determine granularity based on date range
      let granularity = 'day';
      let dateFormat = 'Mon DD';
      let seriesInterval = '1 day';

      if (from && to) {
        const startDate = new Date(from as string);
        const endDate = new Date(to as string);
        const diffDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays > 730) {
          // > 2 years
          granularity = 'year';
          dateFormat = 'YYYY';
          seriesInterval = '1 year';
        } else if (diffDays > 60) {
          // > 2 months
          granularity = 'month';
          dateFormat = 'Mon YYYY';
          seriesInterval = '1 month';
        }
      }

      // Execute queries in parallel for performance
      const [movements, total, stats, historicalStats, chartData] =
        await Promise.all([
          // 1. Movements (Paginated or All)
          prisma.movement.findMany({
            where,
            skip,
            take,
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
            include: {
              user: { select: { name: true } },
            },
          }),
          // 2. Total count for pagination
          prisma.movement.count({ where }),
          // 3. Stats for the filtered period
          prisma.movement.groupBy({
            by: ['type'],
            where,
            _sum: { amount: true },
          }),
          // 4. Historical balance (Total)
          prisma.movement.groupBy({
            by: ['type'],
            where: effectiveUserId ? { userId: effectiveUserId } : {},
            _sum: { amount: true },
          }),
          // 5. Optimized Chart data using Raw SQL with Dynamic Granularity and generate_series
          prisma.$queryRaw`
          WITH date_series AS (
            SELECT generate_series(
              ${from ? new Date(from as string) : Prisma.sql`(SELECT COALESCE(MIN(date), ${startOfToday}) FROM movement ${effectiveUserId ? Prisma.sql`WHERE "userId" = ${effectiveUserId}` : Prisma.empty})`},
              ${to ? new Date(to as string) : endOfToday},
              ${seriesInterval}::interval
            ) as series_date
          )
          SELECT 
            TO_CHAR(ds.series_date AT TIME ZONE 'UTC', ${dateFormat}) as name,
            COALESCE(SUM(CASE WHEN m.type = 'INCOME' THEN m.amount ELSE 0 END), 0)::FLOAT as income,
            COALESCE(SUM(CASE WHEN m.type = 'EXPENSE' THEN m.amount ELSE 0 END), 0)::FLOAT as expense
          FROM date_series ds
          LEFT JOIN movement m ON 
            DATE_TRUNC(${granularity}, m.date AT TIME ZONE 'UTC') = DATE_TRUNC(${granularity}, ds.series_date AT TIME ZONE 'UTC')
            ${effectiveUserId ? Prisma.sql`AND m."userId" = ${effectiveUserId}` : Prisma.empty}
            ${search ? Prisma.sql`AND (m.concept ILIKE ${'%' + search + '%'} OR m.type ILIKE ${'%' + search + '%'})` : Prisma.empty}
          GROUP BY ds.series_date
          ORDER BY ds.series_date ASC
        ` as Promise<{ name: string; income: number; expense: number }[]>,
        ]);

      // Format stats
      const getSum = (
        arr: {
          type: string;
          _sum: { amount: number | Prisma.Decimal | null };
        }[],
        type: string
      ) => {
        const val = arr.find((s) => s.type === type)?._sum.amount;
        return val ? Number(val) : 0;
      };

      const totalIncome = getSum(
        stats as {
          type: string;
          _sum: { amount: number | Prisma.Decimal | null };
        }[],
        'INCOME'
      );
      const totalOutcome = getSum(
        stats as {
          type: string;
          _sum: { amount: number | Prisma.Decimal | null };
        }[],
        'EXPENSE'
      );

      const histIncome = getSum(
        historicalStats as {
          type: string;
          _sum: { amount: number | Prisma.Decimal | null };
        }[],
        'INCOME'
      );
      const histOutcome = getSum(
        historicalStats as {
          type: string;
          _sum: { amount: number | Prisma.Decimal | null };
        }[],
        'EXPENSE'
      );

      return res.status(200).json({
        movements,
        pagination: {
          total,
          page: p,
          pageSize: ps,
          totalPages: Math.ceil(total / ps),
        },
        stats: {
          totalIncome,
          totalOutcome,
          balance: totalIncome - totalOutcome,
          historicalBalance: histIncome - histOutcome,
          chartData,
        },
      });
    }

    if (req.method === 'POST') {
      if (!(await hasPermission(session.user.id, 'movements:create'))) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { concept, amount, date, type } = req.body;

      if (!concept || !amount || !date || !type) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const movement = await prisma.movement.create({
        data: {
          concept,
          amount: parseFloat(amount),
          date: new Date(date),
          type,
          userId: session.user.id,
        },
      });

      return res.status(201).json(movement);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', error: String(error) });
  }
}

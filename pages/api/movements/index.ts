import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hasPermission } from '@/lib/auth/permissions';
import { Prisma } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
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
        global = 'false'
      } = req.query;

      const isAll = all === 'true';
      const isGlobal = global === 'true';
      
      // Security check: Only ADMIN can see global data
      const effectiveUserId = (isGlobal && (await hasPermission(session.user.id, 'users:view'))) 
        ? null 
        : session.user.id;

      const p = parseInt(page as string);
      const ps = parseInt(pageSize as string);
      const skip = isAll ? undefined : (p - 1) * ps;
      const take = isAll ? undefined : ps;

      // Build filters
      const where: any = {};
      
      if (effectiveUserId) {
        where.userId = effectiveUserId;
      }

      if (search) {
        where.OR = [
          { concept: { contains: search as string, mode: 'insensitive' } },
          { type: { contains: search as string, mode: 'insensitive' } },
        ];
      }

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
        const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays > 730) { // > 2 years
          granularity = 'year';
          dateFormat = 'YYYY';
          seriesInterval = '1 year';
        } else if (diffDays > 60) { // > 2 months
          granularity = 'month';
          dateFormat = 'Mon YYYY';
          seriesInterval = '1 month';
        }
      }

      // Execute queries in parallel for performance
      const [movements, total, stats, historicalStats, chartData] = await Promise.all([
        // 1. Movements (Paginated or All)
        prisma.movement.findMany({
          where,
          skip,
          take,
          orderBy: [
            { date: 'desc' },
            { createdAt: 'desc' }
          ],
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
              ${from ? new Date(from as string) : Prisma.sql`(SELECT MIN(date) FROM movement)`},
              ${to ? new Date(to as string) : new Date()},
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
        ` as Promise<any[]>
      ]);

      // Format stats
      const getSum = (arr: any[], type: string) => arr.find(s => s.type === type)?._sum.amount || 0;
      
      const totalIncome = getSum(stats, 'INCOME');
      const totalOutcome = getSum(stats, 'EXPENSE');
      
      const histIncome = getSum(historicalStats, 'INCOME');
      const histOutcome = getSum(historicalStats, 'EXPENSE');

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
          chartData
        }
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
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}

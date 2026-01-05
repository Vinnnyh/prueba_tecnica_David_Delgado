import { GetStaticProps, InferGetStaticPropsType } from 'next';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { spec } from '@/lib/swagger';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      spec,
    },
  };
};

export default function ApiDocs({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI spec={spec} />
    </div>
  );
}

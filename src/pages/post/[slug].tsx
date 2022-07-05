import { GetStaticPaths, GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { AiOutlineCalendar, AiOutlineClockCircle, AiOutlineUser } from 'react-icons/ai'
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { Fragment } from 'react';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();
  if (isFallback) {
    return (
      <span>Carregando...</span>
    )
  }

  const timeToRead = post.data.content.reduce((acc, content) => {
    function countWords(str: string) {
      return str.trim().split(/\s+/).length
    }
    acc += countWords(String(content.heading)) / 200;
    acc += countWords(String(RichText.asText(content.body))) / 200;
    return Math.ceil(acc);
  }, 0);

  return (
    <>
      <Header />
      <main className={styles.container}>
        <img src={post.data.banner.url} alt={`${post.data.title} banner`} />
        <article>
          <div className={styles.postHeader}>
            <h1>{post.data.title}</h1>
            <div >
              <div>
                <AiOutlineCalendar size={20} />
                <span>{format(new Date(post.first_publication_date), 'dd MMM u', {
                  locale: ptBR
                })}</span>
              </div>

              <div>
                <AiOutlineUser size={20} />
                <span>{post.data.author}</span>
              </div>

              <div>
                <AiOutlineClockCircle size={20} />
                <span>{timeToRead} min</span>
              </div>
            </div>
          </div>
          <div className={styles.content}>
            {post.data.content.map((content, index) => (
              <Fragment key={index}>
                <h2>{content.heading}</h2>
                <div
                  key={index}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                ></div>
              </Fragment>
            ))}
          </div>

        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});

  const posts = await prismic.getByType('posts', {
    fetch: ['posts.title', 'posts.banner', 'posts.author', 'posts.content'],
  });

  const paths = posts.results.map(result => ({
    params: {
      slug: result.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
      subtitle: response.data.subtitle,
    },
    uid: response.uid,
  }

  const timeToRevalidate = 60 * 15

  return {
    props: {
      post
    },
    revalidate: timeToRevalidate
  }
};
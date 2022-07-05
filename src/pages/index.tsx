import { GetStaticProps } from 'next';
import { Head } from 'next/document';
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { next_page, results } = postsPagination

  const [posts, setPosts] = useState<Post[]>(results)
  const [nextPage, setNextPage] = useState<string>(next_page);

  function loadPosts() {
    if (nextPage) {
      fetch(nextPage)
        .then(response => response.json())
        .then(data => {
          const newPosts = data.results.map((post: Post) => ({
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          }));

          setNextPage(data.next_page);
          setPosts([...posts, ...newPosts]);
        })
        .catch(() => {
          alert('Erro na aplicação!');
        });
    }
  }

  function handleLoadPostsClick() {
    loadPosts();
  }
  return (
    <>
      <div className={commonStyles.container}>
        <div className={commonStyles.logoContainer}>
          <img
            src="/assets/Logo.png"
            alt="logo"
          />
        </div>
        <main className={commonStyles.postContainer}>
          {
            posts.map(post => {
              return (
                <Link key={post.uid} href={`/post/${post.uid}`}>
                  <a className={commonStyles.post}>
                    <strong>{post.data.title}</strong>
                    <p>{post.data.subtitle}</p>
                    <div className={styles.data}>
                      <time>
                        <FiCalendar size={20} />
                        {format(new Date(post.first_publication_date), 'dd MMM u', {
                          locale: ptBR
                        })}
                      </time>
                      <div className={styles.author}>
                        <FiUser size={20} />
                        {post.data.author}
                      </div>
                    </div>
                  </a>
                </Link>
              )
            })
          }
          {
            nextPage && (
              <strong className={styles.loadPosts} onClick={handleLoadPostsClick}>
                Carregar mais posts
              </strong>
            )
          }
        </main>

      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('posts', {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 5,
  });

  const { next_page, results } = postsResponse;

  const posts: Post[] = results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const timeToRevalidate = 60 * 15;

  return {
    props: {
      postsPagination: {
        next_page: next_page,
        results: posts,
      },
    },
    revalidate: timeToRevalidate,
  }
};

import { render, screen } from '@testing-library/react'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { mocked } from 'ts-jest/utils'
import { getPrismicClient } from '../../services/prismic'
import { getSession } from 'next-auth/client'

const posts = {
    slug: 'new-post',
    title: 'new post',
    content: '<p>post excerpt</p>',
    updatedAt: '22 de março'
}

jest.mock('../../services/prismic')
jest.mock('next-auth/client')

describe('Post page', () => {
    it('renders correctly', () => {
        render(<Post post={posts} />);

        expect(screen.getByText("new post")).toBeInTheDocument();
        expect(screen.getByText("post excerpt")).toBeInTheDocument();
    })

    it('redirects user if no subscription is found', async () => {
        const getSessionMocked = mocked(getSession)

        getSessionMocked.mockResolvedValueOnce(null)

        const response = await getServerSideProps({ params: { slug: 'new post' } } as any)

        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                    destination: '/',
                })
            })
        )
    })

    it('load initial data', async () => {
        const getSessionMocked = mocked(getSession)
        const getPrismicClientMocked = mocked(getPrismicClient)

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-subscription'
        } as any)

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValue({
                data: {
                    title: [{
                        type: 'heading',
                        text: 'new post'
                    }],
                    content: [{
                        type: 'paragraph',
                        text: 'post content'
                    }]

                },
                last_publication_date: '04-01-2021'
            })
        } as any)

        const response = await getServerSideProps({ params: { slug: 'new post' } } as any)

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'new post',
                        title: 'new post',
                        content: '<p>post content</p>',
                        updatedAt: 'April 01, 2021'
                    }
                }
            })
        )
    })
})
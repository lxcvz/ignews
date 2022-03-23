import { render, screen } from '@testing-library/react'
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { mocked } from 'ts-jest/utils'
import { getPrismicClient } from '../../services/prismic'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router'

const posts = {
    slug: 'new-post',
    title: 'new post',
    content: '<p>post excerpt</p>',
    updatedAt: '22 de março'
}

jest.mock('../../services/prismic')
jest.mock('next-auth/client')
jest.mock('next/router')

describe('Post preview page', () => {
    it('renders correctly', () => {
        const useSessionMocked = mocked(useSession)

        useSessionMocked.mockReturnValueOnce([null, false])

        render(<Post post={posts} />);

        expect(screen.getByText("new post")).toBeInTheDocument();
        expect(screen.getByText("post excerpt")).toBeInTheDocument();
        expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
    })

    it('redirects user to full post when subscribed', async () => {
        const useSessionMocked = mocked(useSession)
        const useRouterMocked = mocked(useRouter)
        const pushMock = jest.fn()

        useSessionMocked.mockReturnValueOnce([
            { activeSubscription: 'fake-subscription' },
            false
        ] as any)

        useRouterMocked.mockReturnValueOnce({
            push: pushMock
        } as any)

        render(<Post post={posts} />);

        expect(pushMock).toHaveBeenCalledWith('/posts/new-post')
    })

    it('load initial data', async () => {
        const getPrismicClientMocked = mocked(getPrismicClient)

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

        const response = await getStaticProps({ params: { slug: 'new-post' } })

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'new-post',
                        title: 'new post',
                        content: '<p>post content</p>',
                        updatedAt: 'April 01, 2021'
                    }
                }
            })
        )
    })
})
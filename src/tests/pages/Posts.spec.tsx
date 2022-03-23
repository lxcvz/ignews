import { render, screen } from '@testing-library/react'
import Posts, { getStaticProps } from '../../pages/posts'
import { mocked } from 'ts-jest/utils'
import { getPrismicClient } from '../../services/prismic'

const posts = [{
    slug: 'new-post',
    title: 'new post',
    excerpt: 'new-post-excerpt',
    updatedAt: '22 de março'
}]

jest.mock('../../services/prismic')

describe('Posts page', () => {
    it('renders correctly', () => {
        render(<Posts posts={posts} />);

        expect(screen.getByText("new post")).toBeInTheDocument();
    })

    it('load initial data', async () => {
        const getPrismicClientMocked = mocked(getPrismicClient)

        getPrismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
                results: [
                    {
                        uid: 'new-post',
                        data: {
                            title: [{
                                type: 'heading',
                                text: 'new post'
                            }],
                            content: [{
                                type: 'paragraph',
                                text: 'post excerpt'
                            }]
                        },
                        last_publication_date: '03-22-2022'
                    }
                ]
            })
        } as any)

        const response = await getStaticProps({})

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    posts: [{
                        slug: 'new-post',
                        title: 'new post',
                        excerpt: 'post excerpt',
                        updatedAt: 'March 22, 2022'
                    }]
                }
            })
        )
    })
})
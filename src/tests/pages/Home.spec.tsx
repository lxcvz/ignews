import { render, screen } from '@testing-library/react'
import Home from '../../pages'

jest.mock('next/router')

jest.mock('next-auth/client', () => {
  return {
    useSession() {
      return [null, false]
    }
  }
})
describe('home page', () => {
  it('renders correctly', () => {
    render(<Home product={{ priceId: 'fake-price-id', amount: 'R$ 150.00' }} />);

    expect(screen.getByText("for R$ 150.00 month")).toBeInTheDocument();
  })
})
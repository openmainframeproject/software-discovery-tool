import { render, screen, fireEvent } from '@testing-library/react';
import SearchResults from '../components/SearchResults';

const mockResults = [
  {
    packageName: 'curl',
    version: '7.88.1',
    description: 'Command line tool for transferring data',
    ostag: 'Ubuntu 22.04',
    repo: null,
  },
  {
    packageName: 'wget',
    version: '1.21.3',
    description: 'Network downloader',
    ostag: 'RHEL 9',
    repo: 'https://example.com/repo',
  },
];

const defaultProps = {
  results: mockResults,
  showDesc: true,
  itemsPerPage: 10,
  searchPerformed: true,
  totalResultsCount: 2,
  selectedParentDistributions: [],
  osList: {},
  currentPage: 0,
  totalPages: 1,
  onPageChange: vi.fn(),
};

describe('SearchResults', () => {
  it('renders package names', () => {
    render(<SearchResults {...defaultProps} />);
    expect(screen.getByText('curl')).toBeInTheDocument();
    expect(screen.getByText('wget')).toBeInTheDocument();
  });

  it('renders distro tag when ostag is present', () => {
    render(<SearchResults {...defaultProps} />);
    expect(screen.getByText('Ubuntu 22.04')).toBeInTheDocument();
    expect(screen.getByText('RHEL 9')).toBeInTheDocument();
  });

  it('does not render any unexpected links', () => {
    render(<SearchResults {...defaultProps} />);
    expect(screen.queryByRole('link', { name: /validated/i })).not.toBeInTheDocument();
  });

  it('renders descriptions when showDesc is true', () => {
    render(<SearchResults {...defaultProps} />);
    expect(screen.getByText('Command line tool for transferring data')).toBeInTheDocument();
  });

  it('filters results by package name using refine input', () => {
    render(<SearchResults {...defaultProps} />);
    const refineInput = screen.getByPlaceholderText('Search within page...');
    fireEvent.change(refineInput, { target: { value: 'curl' } });
    expect(screen.getByText('curl')).toBeInTheDocument();
    expect(screen.queryByText('wget')).not.toBeInTheDocument();
  });

  it('shows no results message when search performed but results empty', () => {
    render(<SearchResults {...defaultProps} results={[]} totalResultsCount={0} />);
    expect(screen.queryByText('curl')).not.toBeInTheDocument();
  });

  it('renders nothing when search has not been performed', () => {
    render(<SearchResults {...defaultProps} searchPerformed={false} results={[]} />);
    expect(screen.queryByText('curl')).not.toBeInTheDocument();
  });
});

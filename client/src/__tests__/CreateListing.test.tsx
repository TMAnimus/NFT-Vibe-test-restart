import { render, screen, fireEvent } from '@testing-library/react';
import CreateListing from '../components/CreateListing';
import { mockNFTOwned, mockNFTWithProps, mockNFTListed, mockNFTAuction } from '../testFixtures';
import type { NFT } from '../types';

window.alert = jest.fn();

describe('CreateListing', () => {
  const onClose = jest.fn();
  const onCreateListing = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  const renderWith = (nfts: NFT[]) =>
    render(
      <CreateListing
        userNFTs={nfts}
        onCreateListing={onCreateListing}
        onClose={onClose}
      />
    );

  it('renders the modal heading and close button', () => {
    renderWith([]);
    expect(screen.getByText('Create New Listing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
  });

  it('calls onClose when × is clicked', () => {
    renderWith([]);
    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('only shows Owned NFTs in the dropdown', () => {
    renderWith([mockNFTOwned, mockNFTListed, mockNFTAuction]);
    // Only Owned NFTs should appear as options (plus placeholder)
    const options = screen.getAllByRole('option');
    const values = options.map(o => (o as HTMLOptionElement).value);
    expect(values).toContain('nft1');   // Owned
    expect(values).not.toContain('nft3'); // Listed
    expect(values).not.toContain('nft4'); // Auction
  });

  it('shows empty state message when no Owned NFTs exist', () => {
    renderWith([mockNFTListed, mockNFTAuction]);
    expect(screen.getByText(/NFTs must have/i)).toBeInTheDocument();
  });

  it('submit button is disabled when no Owned NFTs', () => {
    renderWith([]);
    expect(screen.getByRole('button', { name: /list for sale/i })).toBeDisabled();
  });

  it('shows fixed price section by default', () => {
    renderWith([mockNFTOwned]);
    expect(screen.getByText('Fixed Price Sale')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter sale price')).toBeInTheDocument();
  });

  it('submits a fixed price listing with correct data', () => {
    renderWith([mockNFTOwned]);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'nft1' } });
    fireEvent.change(screen.getByPlaceholderText('Enter sale price'), {
      target: { value: '200' },
    });
    fireEvent.click(screen.getByRole('button', { name: /list for sale/i }));

    expect(onCreateListing).toHaveBeenCalledWith('nft1', 'fixed', { price: 200 });
  });

  it('shows auction fields when Auction radio is selected', () => {
    renderWith([mockNFTOwned]);
    fireEvent.click(screen.getByRole('radio', { name: /auction/i }));
    expect(screen.getByText('Auction Settings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start auction/i })).toBeInTheDocument();
  });

  it('submits a standard auction with correct data', () => {
    renderWith([mockNFTOwned]);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'nft1' } });
    fireEvent.click(screen.getByRole('radio', { name: /auction/i }));
    fireEvent.change(screen.getByPlaceholderText('Enter minimum bid'), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByRole('button', { name: /start auction/i }));

    expect(onCreateListing).toHaveBeenCalledWith(
      'nft1',
      'auction',
      expect.objectContaining({ auctionType: 'standard', startingBid: 50 })
    );
  });

  it('shows reserve price field when Reserve auction type is selected', () => {
    renderWith([mockNFTOwned]);
    fireEvent.click(screen.getByRole('radio', { name: /auction/i }));
    // Select the auction type dropdown by its label text
    const auctionTypeSelect = screen.getByDisplayValue('🔨 Standard Auction (bids increase)');
    fireEvent.change(auctionTypeSelect, { target: { value: 'reserve' } });
    expect(screen.getByPlaceholderText('Hidden minimum price (optional)')).toBeInTheDocument();
  });

  it('shows first-of-set indicator in NFT description', () => {
    renderWith([mockNFTWithProps]);
    const option = screen.getByRole('option', { name: /FIRST OF SET/i });
    expect(option).toBeInTheDocument();
  });

  it('includes props in NFT description', () => {
    renderWith([mockNFTWithProps]);
    const option = screen.getByRole('option', { name: /sceptre/i });
    expect(option).toBeInTheDocument();
  });
});

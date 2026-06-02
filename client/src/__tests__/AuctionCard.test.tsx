import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AuctionCard from '../components/AuctionCard';
import {
  mockAuctionActive,
  mockAuctionDutch,
  mockAuctionReserve,
  mockAuctionEnded,
} from '../testFixtures';

describe('AuctionCard', () => {
  const onBid = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders the NFT description', () => {
    render(<AuctionCard auction={mockAuctionActive} onBid={onBid} />);
    expect(screen.getByText(/Red Potato/i)).toBeInTheDocument();
  });

  it('renders the seller username', () => {
    render(<AuctionCard auction={mockAuctionActive} onBid={onBid} />);
    expect(screen.getByText(/seller1/)).toBeInTheDocument();
  });

  it('renders Standard auction type label', () => {
    render(<AuctionCard auction={mockAuctionActive} onBid={onBid} />);
    expect(screen.getByText('🔨 Standard Auction')).toBeInTheDocument();
  });

  it('renders Dutch auction type label', () => {
    render(<AuctionCard auction={mockAuctionDutch} onBid={onBid} />);
    expect(screen.getByText('⚡ Dutch Auction')).toBeInTheDocument();
  });

  it('renders Reserve auction type label', () => {
    render(<AuctionCard auction={mockAuctionReserve} onBid={onBid} />);
    expect(screen.getByText('💎 Reserve Auction')).toBeInTheDocument();
  });

  it('shows dutchCurrentPrice for Dutch auctions', () => {
    render(<AuctionCard auction={mockAuctionDutch} onBid={onBid} />);
    expect(screen.getByText('$180')).toBeInTheDocument();
  });

  it('shows currentBid for standard auctions', () => {
    render(<AuctionCard auction={mockAuctionActive} onBid={onBid} />);
    expect(screen.getByText('$120')).toBeInTheDocument();
  });

  it('shows ACTIVE status badge', () => {
    render(<AuctionCard auction={mockAuctionActive} onBid={onBid} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('shows ENDED status badge', () => {
    render(<AuctionCard auction={mockAuctionEnded} onBid={onBid} />);
    expect(screen.getByText('ENDED')).toBeInTheDocument();
  });

  it('shows "This is your auction" when currentUserId matches seller', () => {
    render(
      <AuctionCard
        auction={mockAuctionActive}
        onBid={onBid}
        currentUserId="seller1"
      />
    );
    expect(screen.getByText(/this is your auction/i)).toBeInTheDocument();
  });

  it('does not show bid button when current user is the seller', () => {
    render(
      <AuctionCard
        auction={mockAuctionActive}
        onBid={onBid}
        currentUserId="seller1"
      />
    );
    expect(screen.queryByRole('button', { name: /place bid/i })).toBeNull();
  });

  it('shows Place Bid button for active auction when not the seller', () => {
    render(
      <AuctionCard
        auction={mockAuctionActive}
        onBid={onBid}
        currentUserId="buyer1"
      />
    );
    expect(screen.getByRole('button', { name: /place bid/i })).toBeInTheDocument();
  });

  it('shows bid form when Place Bid button is clicked', () => {
    render(
      <AuctionCard
        auction={mockAuctionActive}
        onBid={onBid}
        currentUserId="buyer1"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /place bid/i }));
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^bid$/i })).toBeInTheDocument();
  });

  it('calls onBid with auction id and bid amount on submit', () => {
    render(
      <AuctionCard
        auction={mockAuctionActive}
        onBid={onBid}
        currentUserId="buyer1"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /place bid/i }));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '150' } });
    fireEvent.click(screen.getByRole('button', { name: /^bid$/i }));
    expect(onBid).toHaveBeenCalledWith('auction1', 150);
  });

  it('hides bid form when Cancel is clicked', () => {
    render(
      <AuctionCard
        auction={mockAuctionActive}
        onBid={onBid}
        currentUserId="buyer1"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /place bid/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('spinbutton')).toBeNull();
  });

  it('shows reserve status for reserve auctions', () => {
    render(<AuctionCard auction={mockAuctionReserve} onBid={onBid} />);
    expect(screen.getByText(/reserve price/i)).toBeInTheDocument();
  });

  it('shows countdown timer', () => {
    render(<AuctionCard auction={mockAuctionActive} onBid={onBid} />);
    // Timer shows h/m/s format
    expect(screen.getByText(/⏰/)).toBeInTheDocument();
  });

  it('shows Ended when endTime is in the past', () => {
    render(<AuctionCard auction={mockAuctionEnded} onBid={onBid} />);
    expect(screen.getByText(/Ended/)).toBeInTheDocument();
  });

  it('shows first-of-set indicator in NFT description', () => {
    const auctionWithFirstOfSet = {
      ...mockAuctionActive,
      nftId: { ...mockAuctionActive.nftId, isFirstOfSet: true },
    };
    render(<AuctionCard auction={auctionWithFirstOfSet} onBid={onBid} />);
    expect(screen.getByText(/FIRST OF SET/)).toBeInTheDocument();
  });

  it('shows winner username when auction has a winner', () => {
    render(<AuctionCard auction={mockAuctionEnded} onBid={onBid} />);
    expect(screen.getByText(/buyer1/)).toBeInTheDocument();
  });
});

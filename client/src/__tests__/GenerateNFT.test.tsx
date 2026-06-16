import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenerateNFT from '../components/GenerateNFT';
import * as api from '../services/api';

jest.mock('../services/api');

// alert is called on success — suppress it in tests
window.alert = jest.fn();

describe('GenerateNFT', () => {
  const onClose = jest.fn();
  const onNFTGenerated = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  const renderComponent = () =>
    render(<GenerateNFT onClose={onClose} onNFTGenerated={onNFTGenerated} />);

  it('renders the modal with heading and collection dropdown', () => {
    renderComponent();
    expect(screen.getByText('Generate New NFT')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate nft/i })).toBeInTheDocument();
  });

  it('renders all 15 collections in the dropdown', () => {
    renderComponent();
    const options = screen.getAllByRole('option');
    // 15 collections + 1 placeholder
    expect(options).toHaveLength(16);
    expect(screen.getByRole('option', { name: 'Crypto Potatoes' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Apathetic Axolotls' })).toBeInTheDocument();
  });

  it('shows error when submitting without selecting a collection', async () => {
    renderComponent();
    // Submit the form directly — bypasses the native `required` constraint in jsdom
    const form = document.querySelector('form')!;
    fireEvent.submit(form);
    await waitFor(() =>
      expect(screen.getByText('Please select a collection')).toBeInTheDocument()
    );
    expect(api.generateNFT).not.toHaveBeenCalled();
  });

  it('calls generateNFT and fires callbacks on success', async () => {
    (api.generateNFT as jest.Mock).mockResolvedValue({
      displayName: 'Red Potato',
      color: 'Red',
      thing: 'Potato',
    });
    renderComponent();

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Crypto Potatoes' },
    });
    fireEvent.click(screen.getByRole('button', { name: /generate nft/i }));

    await waitFor(() => {
      expect(api.generateNFT).toHaveBeenCalledWith('Crypto Potatoes');
      expect(onNFTGenerated).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error message when API call fails', async () => {
    (api.generateNFT as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
    renderComponent();

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Crypto Toasters' },
    });
    fireEvent.click(screen.getByRole('button', { name: /generate nft/i }));

    await waitFor(() =>
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows loading state while generating', async () => {
    let resolve: (v: any) => void;
    (api.generateNFT as jest.Mock).mockReturnValue(
      new Promise(r => { resolve = r; })
    );
    renderComponent();

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Crypto Potatoes' },
    });
    fireEvent.click(screen.getByRole('button', { name: /generate nft/i }));

    expect(screen.getByText('Generating...')).toBeInTheDocument();

    // Clean up
    resolve!({ displayName: 'Red Potato' });
  });

  it('calls onClose when Cancel is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

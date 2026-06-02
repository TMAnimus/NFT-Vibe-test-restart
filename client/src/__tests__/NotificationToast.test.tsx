import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NotificationToast from '../components/NotificationToast';

const baseNotification = {
  id: '1',
  title: 'Test title',
  message: 'Test message',
};

describe('NotificationToast', () => {
  it('renders nothing when notifications array is empty', () => {
    const { container } = render(
      <NotificationToast notifications={[]} onRemove={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a notification with title and message', () => {
    render(
      <NotificationToast
        notifications={[{ ...baseNotification, type: 'info' }]}
        onRemove={jest.fn()}
      />
    );
    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders the correct icon for each type', () => {
    const types = [
      { type: 'success' as const, icon: '✅' },
      { type: 'error'   as const, icon: '❌' },
      { type: 'warning' as const, icon: '⚠️' },
      { type: 'info'    as const, icon: 'ℹ️' },
    ];

    types.forEach(({ type, icon }) => {
      const { unmount } = render(
        <NotificationToast
          notifications={[{ ...baseNotification, id: type, type }]}
          onRemove={jest.fn()}
        />
      );
      expect(screen.getByText(icon)).toBeInTheDocument();
      unmount();
    });
  });

  it('calls onRemove with the notification id when close button clicked', () => {
    const onRemove = jest.fn();
    render(
      <NotificationToast
        notifications={[{ ...baseNotification, type: 'success' }]}
        onRemove={onRemove}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledWith('1');
  });

  it('renders multiple notifications', () => {
    render(
      <NotificationToast
        notifications={[
          { id: '1', type: 'success', title: 'First',  message: 'Msg 1' },
          { id: '2', type: 'error',   title: 'Second', message: 'Msg 2' },
        ]}
        onRemove={jest.fn()}
      />
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('auto-dismisses after duration', () => {
    jest.useFakeTimers();
    const onRemove = jest.fn();
    render(
      <NotificationToast
        notifications={[{ ...baseNotification, type: 'info', duration: 1000 }]}
        onRemove={onRemove}
      />
    );
    act(() => { jest.advanceTimersByTime(1100); });
    expect(onRemove).toHaveBeenCalledWith('1');
    jest.useRealTimers();
  });

  it('does not auto-dismiss when duration is 0 (persistent)', () => {
    jest.useFakeTimers();
    const onRemove = jest.fn();
    render(
      <NotificationToast
        notifications={[{ ...baseNotification, type: 'info', duration: 0 }]}
        onRemove={onRemove}
      />
    );
    act(() => { jest.advanceTimersByTime(10000); });
    expect(onRemove).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});

import '@testing-library/jest-dom';

// Polyfills required by react-router-dom v7 in jsdom
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

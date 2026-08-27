@extends('layouts.error')
@section('content')
    <img src="{{ asset('images/errors/403.svg') }}" class="error-art" alt="Access forbidden illustration">

    <span class="error-code">{{ __('Error 403') }}</span>

    <h1 class="error-title">{{ __('Access Forbidden!') }}</h1>

    <p class="error-text">{{ __("You don't have permission to access this page.") }}</p>

    <div class="error-actions">
        <a href="/" class="error-btn error-btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" /></svg>
            {{ __('Back to Home') }}
        </a>

        <button type="button" onclick="window.history.back()" class="error-btn error-btn-ghost">
            {{ __('Go Back') }}
        </button>
    </div>
@endsection

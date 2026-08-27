@extends('layouts.error')
@section('content')
    <img src="{{ asset('images/errors/419.svg') }}" class="error-art" alt="Page expired illustration">

    <span class="error-code">{{ __('Error 419') }}</span>

    <h1 class="error-title">{{ __('Page Expired!') }}</h1>

    <p class="error-text">{{ __("Your session has expired. Please refresh the page and try again.") }}</p>

    <div class="error-actions">
        <a href="/" class="error-btn error-btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" /></svg>
            {{ __('Back to Home') }}
        </a>

        <button type="button" onclick="window.location.reload()" class="error-btn error-btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" /></svg>
            {{ __('Refresh Page') }}
        </button>
    </div>
@endsection

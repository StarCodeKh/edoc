@extends('layouts.error')
@section('content')
    <section class="relative overflow-hidden">
        <div class="container-fluid relative">
            <div class="grid grid-cols-1">
                <div class="flex flex-col min-h-screen justify-center items-center md:px-10 py-10 px-4 relative">

                    {{-- Decorative background blobs --}}
                    <div class="absolute top-1/4 -left-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"></div>
                    <div class="absolute bottom-1/4 -right-10 w-72 h-72 bg-red-500/20 rounded-full blur-3xl"></div>

                    <div class="title-heading text-center my-auto relative z-10">
                        <img src="{{ asset('images/errors/403.svg') }}"
                             class="h-52 mx-auto mb-6 animate-[bounce_3s_ease-in-out_infinite] drop-shadow-xl"
                             alt="Access forbidden illustration">

                        <h1 class="mt-6 mb-4 md:text-5xl text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
                            {{ __('Access Forbidden!') }}
                        </h1>

                        <p class="text-slate-400 max-w-md mx-auto">
                            {{ __("You don't have permission to access this page.") }}
                        </p>

                        <div class="mt-8 flex items-center justify-center gap-3">
                            <a href="/"
                               class="btn inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 border border-amber-600 hover:border-amber-700 text-white rounded-full shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
                                </svg>
                                {{ __('Back to Home') }}
                            </a>

                            <button onclick="window.history.back()"
                                    class="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300">
                                {{ __('Go Back') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div><!--end grid-->
        </div><!--end container-->
    </section><!--end section-->
@endsection
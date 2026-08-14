<!DOCTYPE html>
<html lang="en" class="light scroll-smooth " dir="ltr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta content="eDoc" name="description" />
    <meta name="website" content="https://edoc.cgmc.gov.kh" />
    <meta name="email" content="info@edoc.com" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="shortcut icon" href="/favicon.png">
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">

</head>
<body class="font-inter leading-none antialiased">
<section class="text-center py-6">
    @yield('content')
</section>
</body>
</html>
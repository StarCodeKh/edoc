<template>
    <div class="processing-overlay flex justify-center pt-20">
        <div class="background"></div>
        <div class="loader">
            <svg width="80px" height="80px"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style="background: none;">
                <circle cx="75" cy="50" fill="#ffffff" r="6.39718">
                    <animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.875s"></animate>
                </circle>
                <circle cx="67.678" cy="67.678" fill="#ffffff" r="4.8">
                    <animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.75s"></animate>
                </circle>
                <circle cx="50" cy="75" fill="#ffffff" r="4.8">
                    <animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.625s"></animate>
                </circle>
                <circle cx="32.322" cy="67.678" fill="#ffffff" r="4.8">
                    <animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.5s"></animate>
                </circle>
                <circle cx="25" cy="50" fill="#ffffff" r="4.8">
                    <animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.375s"></animate>
                </circle>
                <circle cx="32.322" cy="32.322" fill="#ffffff" r="4.80282">
                    <animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.25s"></animate>
                </circle>
                <circle cx="50" cy="25" fill="#ffffff" r="6.40282">
                    <animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.125s"></animate>
                </circle>
                <circle cx="67.678" cy="32.322" fill="#ffffff" r="7.99718">
                    <animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="0s"></animate>
                </circle>
            </svg>
        </div>
    </div>
</template>

<script>
export default {
    name: 'loader',
}
</script>


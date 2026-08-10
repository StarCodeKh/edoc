<template>
    <div tabindex="-1" aria-hidden="true" class="bg-[#0000004a] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
        <div class="relative top-[20%] p-4 w-full max-w-md h-full md:h-auto mx-auto">
            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <button @click="$emit('popup')" type="button" class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <icon class="w-5 h-5" name="close" />
                    <span class="sr-only">Close modal</span>
                </button>
                <h3 class="font-semibold text-md mb-2">Are you sure?</h3>
                <p class="mb-4 leading-6 text-gray-500 dark:text-gray-300">
                    {{ details }}
                </p>
                <div class="flex justify-start items-center space-x-4">
                    <button @click="$emit('popup')" type="button" class="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                        No, cancel
                    </button>
                    <button @click="$emit('confirm')" type="submit" class="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
                        Yes, I'm sure
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue'
export default {
    name: 'delete-confirmation',
    props: {
        details: { required: false },
    },
    components: { Icon },
    data() {
        return {

        }
    },
    methods: {

    }
}
</script>

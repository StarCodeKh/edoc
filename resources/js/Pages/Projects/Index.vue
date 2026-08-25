<template>
    <div class="h-full">
        <Head :title="$t(title)" />

        <div
            class="absolute flex h-full flex-col relative flex-1 overflow-y-auto task_board flex flex-col lg:flex-row gap-5"
        ></div>

        <task-details v-if="taskDetailsOpen" :id="taskDetailsId" @closeModal="taskDetailsOpen = false" />
    </div>
</template>

<script>
import { Head, Link } from '@inertiajs/vue3';
import Layout from '@/Shared/Layout.vue';
import Icon from '@/Shared/Icon.vue';
import TaskDetails from '@/Shared/Modals/TaskDetails.vue';

export default {
    metaInfo: { title: 'Dashboard' },
    components: {
        Head,
        Icon,
        Link,
        TaskDetails,
    },
    layout: Layout,
    props: {
        auth: Object,
        tasks: Object,
        board_lists: Object,
        list_index: Array,
        title: String,
    },
    data() {
        return {
            errors: [],
            loading: false,
            firstResponse: [],
            lastResponse: [],
            taskDetailsOpen: false,
            months: [],
            drag: false,
            taskDetailsId: '',
            tasks: [
                {
                    title: 'This is the title of the card for the thing that needs to be done.',
                    id: 1,
                    tag: 'Design',
                    date: 'Dec 12',
                    comment: 4,
                    attachment: 1,
                },
                {
                    title: 'This is the title of the card for the thing that needs to be done.',
                    id: 2,
                    tag: 'Dev',
                    date: 'Dec 12',
                    comment: 4,
                    attachment: 1,
                },
                {
                    title: 'This is the title of the card for the thing that needs to be done.',
                    id: 3,
                    tag: 'UX',
                    date: 'Dec 12',
                    comment: 4,
                    attachment: 1,
                },
                {
                    title: 'This is the title of the card for the thing that needs to be done.',
                    id: 4,
                    tag: 'UI',
                    date: 'Dec 12',
                    comment: 4,
                    attachment: 1,
                },
                {
                    title: 'This is the title of the card for the thing that needs to be done.',
                    id: 5,
                    tag: 'Other',
                    date: 'Dec 12',
                    comment: 4,
                    attachment: 1,
                },
            ],
            list: [
                {
                    name: 'Backlog',
                    id: 'list1',
                    tasks: [
                        {
                            title: 'Title 1',
                            id: 1,
                            tag: 'Design',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 2,
                            tag: 'Dev',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'Title 3',
                            id: 3,
                            tag: 'UX',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 4,
                            tag: 'UI',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 5,
                            tag: 'Other',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                    ],
                },
                {
                    name: 'Ready',
                    id: 'list2',
                    tasks: [
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 6,
                            tag: 'Design',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 7,
                            tag: 'Dev',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 8,
                            tag: 'UX',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 9,
                            tag: 'UI',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 10,
                            tag: 'Other',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                    ],
                },
                {
                    name: 'Doing',
                    id: 'list3',
                    tasks: [
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 11,
                            tag: 'Design',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 12,
                            tag: 'Dev',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 13,
                            tag: 'UX',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 14,
                            tag: 'UI',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                        {
                            title: 'This is the title of the card for the thing that needs to be done.',
                            id: 15,
                            tag: 'Other',
                            date: 'Dec 12',
                            comment: 4,
                            attachment: 1,
                        },
                    ],
                },
                {
                    name: 'Review',
                    id: 'list4',
                    tasks: [],
                },
                {
                    name: 'Blocked',
                    id: 'list5',
                    tasks: [],
                },
                {
                    name: 'Done',
                    id: 'list6',
                    tasks: [],
                },
            ],
        };
    },
    computed: {
        isModalVisible() {
            return this.taskDetailsOpen;
        },
    },
    created() {
        // for (let i = 0; i < this.list.length; i++) {
        //     this.list[i].tasks = [...this.tasks];
        // }
        // console.log(this.list[1].tasks);

        let currentUrl = this.$page.url.substr(1);
        const currentUrlArray = currentUrl.split('/');

        // if (urls[0] === '') {
        //     return currentUrl === ''
        // }
        // return urls.filter(url => currentUrl.startsWith(url)).length

        console.log(this.board_lists);
    },
    methods: {
        taskDetails(id) {
            this.taskDetailsId = id;
            this.taskDetailsOpen = true;
        },
        goToLink(link) {
            window.location.href = link;
        },
        add: function () {
            this.list.push({ name: 'Juan' });
        },
        replace: function () {
            this.list = [{ name: 'Edgard' }];
        },
        clone: function (el) {
            return {
                name: el.name + ' cloned',
            };
        },
        log: function (evt) {
            window.console.log(evt);
        },
    },
};
</script>

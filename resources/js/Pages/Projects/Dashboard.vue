<template>
    <div class="h-full">
        <Head :title="$t(title)" />
        <board-view-menu :project="project" view="dashboard" />
        <div class="flex flex-col task__dashboard px-4 py-4 gap-4 h-[calc(100%-52px)] overflow-hidden overflow-y-auto">
            <div class="flex gap-5 flex-col lg:flex-row w-full">
                <div class="w-full bg-white rounded-lg shadow-lg p-10">
                    <div class="w-full">
                        <apexchart type="bar" :options="co_per_list" height="400" :series="series_per_list"></apexchart>
                    </div>
                </div>
                <div class="w-full bg-white rounded-lg shadow-lg p-10">
                    <div class="w-full">
                        <apexchart type="bar" :options="co_per_label" height="400" :series="series_per_label"></apexchart>
                    </div>
                </div>
            </div>
            <div class="flex gap-5 flex-col lg:flex-row w-full">
                <div class="w-full lg:w-1/2 bg-white rounded-lg shadow-lg p-10">
                    <div class="w-full">
                        <apexchart type="bar" :options="co_per_assignee" height="400" :series="series_per_assignee"></apexchart>
                    </div>
                </div>
                <div class="w-full lg:w-1/2 bg-white rounded-lg shadow-lg p-10">
                    <div class="w-full">
                        <apexchart type="bar" :options="co_per_due" height="400" :series="series_per_due"></apexchart>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import {Head, Link} from '@inertiajs/vue3'
import Layout from '@/Shared/Layout.vue'
import Icon from '@/Shared/Icon.vue'
import BoardViewMenu from '@/Shared/BoardViewMenu.vue'

export default {
    components: {
        Head,
        Icon,
        Link,
        BoardViewMenu,
    },
    layout: Layout,
    props: {
        title: String,
        auth: Object,
        project: Object,
        per_list: Object,
        per_assignee: Object,
        per_label: Object,
        due_data: {
            required: true,
        }
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
            co_per_list: {},
            series_per_list: [],
            co_per_assignee: {},
            series_per_assignee: [],
            co_per_label: {},
            series_per_label: [],
            co_per_due: {},
            series_per_due: [],
        }
    },
    computed: {
        isModalVisible() {
            return this.taskDetailsOpen;
        }
    },
    created() {
        this.getPerListReady('co_per_list', 'series_per_list', 'per_list', 'list', 'title');
        this.getPerListReady('co_per_assignee', 'series_per_assignee', 'per_assignee', 'user', 'name');
        this.getPerListReady('co_per_label', 'series_per_label', 'per_label', 'label', 'name');
        this.getPerListReady('co_per_due', 'series_per_due', 'due_data', 'due', 'name');
        this.co_per_label.colors = this.per_label.map( pl => pl.label.color );
        this.co_per_label.plotOptions.bar.distributed = true;
        this.co_per_due.colors = this.due_data.map( pl => pl.due.color );
        this.co_per_due.plotOptions.bar.distributed = true;
    },
    methods: {
        getPerListReady(co_prop, series_prop, props, prop_c, prop_v){
            const co = {
                colors: ['#7366ff'],
                plotOptions: {
                    bar: {
                        borderRadius: 2,
                    },
                },
                xaxis: {
                    labels: {
                        rotate: -45
                    },
                    categories: [],
                    tickPlacement: 'on',
                },
                chart: {
                    toolbar: {
                        tools: {
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
                            reset: false,
                        },
                    }
                },
            };
            const series = [{
                name: 'Total',
                data: []
            }];
            if(this[props]){
                this[co_prop] = Object.assign({}, co);
                this[series_prop] = [...series];
                this[co_prop].xaxis.categories = this[props].map( pl => pl[prop_c][prop_v] );
                this[series_prop][0].data = this[props].map( pl => pl.total );
            }
        },
    },
}
</script>

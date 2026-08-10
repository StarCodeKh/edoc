<template>
  <div class="sec-cont">
    <Head :title="$t(title)" />

      <div class="bg-white rounded-md shadow overflow-hidden mr-2">
          <div class="px-8 py-8 flex flex-wrap">
              <div class="assigned_user pr-6 pb-8 w-full lg:w-full flex flex-col">
                  <div class="font-bold mb-1">{{ $t('Pre made list') }} </div>
                  <p class="pt-1 text-sm">If you enable pre made list option - this list will be available while create a new project</p>
              </div>
              <div class="flex items-center mb-4">
                  <input id="enableRegistration" type="checkbox" v-model="form.enable_pre_made_board" @change="update()" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600">
                  <label for="enableRegistration" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{ $t('Enable pre made board list') }}</label>
              </div>
          </div>
          <div class="px-8 flex w-full">
              <input type="email" v-model="new_list" @keyup.enter="update()" aria-describedby="helper-text-explanation" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-2" placeholder="e.g. To Do">
              <div class="inline-flex items-center px-2 ml-1 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300">
              <button type="button" class="inline-flex items-center p-1 px-2 text-sm text-blue-400 rounded-sm" @click="update()">
                  <Icon name="plus" class="w-4 h-4" />
                  <span class="pl-1">Add new</span>
              </button>
              </div>
          </div>
          <div class="px-8 pb-8 pt-4 flex w-full">
              <div v-for="(list, li) in lists" :key="li" :id="'list_'+li" class="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300">
                  {{ list }}
                  <button @click="remove(li)" type="button" class="inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-sm hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300" :data-dismiss-target="'#list_'+li" aria-label="Remove">
                      <Icon name="close" class="w-2 h-2" />
                  </button>
              </div>
          </div>

    </div>
  </div>
</template>

<script>
import { Link, Head } from '@inertiajs/vue3'
import Icon from '@/Shared/Icon.vue'
import Layout from '@/Shared/Layout.vue'
import Pagination from '@/Shared/Pagination.vue'
import SearchInput from '@/Shared/SearchInput.vue'

export default {
  metaInfo: { title: 'Roles' },
  components: {
    Icon,
    Link,
    Head,
    Pagination,
      SearchInput,
  },
  layout: Layout,
  props: {
      title: String,
      enable_list: { require: false },
      lists: { require: false },
  },
  data() {
    return {
        new_list: '',
        form: this.$inertia.form({
            enable_pre_made_board: this.enable_list,
            pre_made_board_list: this.lists,
        }),
    }
  },
    created() {
        console.log(this.enable_list)
    },
  methods: {
      updateList(){
          if(!!this.new_list){
              this.form.pre_made_board_list.push(this.new_list)
          }
          this.new_list = '';
      },
      remove(index){
          this.form.pre_made_board_list.splice(index, 1);
          this.update();
      },
      update() {
          this.updateList();
          this.form.post(this.route('global.update.pre_made_list'));
      },
  },
}
</script>

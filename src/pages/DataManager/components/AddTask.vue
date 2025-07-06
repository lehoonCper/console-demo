<template>
    <AddTaskMain 
        :current-category="currentCategory"
        :is-new-category="isNewCategory"
        :category-info="categoryInfo"
        :edit-task-data="editTaskData"
        @task-added="$emit('task-added', $event)"
        @cancel-edit="$emit('cancel-edit')"
    />
</template>

<script>
import AddTaskMain from './AddTask/Main.vue';

export default {
    name: 'AddTask',
    components: {
        AddTaskMain
    },
    props: {
        currentCategory: {
            type: String,
            default: ''
        },
        isNewCategory: {
            type: Boolean,
            default: false
        },
        categoryInfo: {
            type: Object,
            default: null
        },
        editTaskData: {
            type: Object,
            default: null
        }
    },
    emits: ['task-added', 'cancel-edit']
}
</script>

 
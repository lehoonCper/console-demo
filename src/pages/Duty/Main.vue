<template>
    <div class="duty-view-container">
        <CommonHeader />
        
       <div class="duty-step-container">
        <div style="height: 300px; max-width: 600px">
            <el-steps direction="vertical" :active="1">
                <el-step title="Step 1" />
                
                <el-step title="Step 2" />
                <el-step title="Step 3" />
                </el-steps>
            </div>
        </div>
    </div>
</template>


<script>
import CommonHeader from '@/global_components/CommonHeader.vue';
export default {
    name: 'DutyView',
    components: {
        CommonHeader
    }
}
</script>

<style scoped>
.duty-view-container {
    height: 100%;
   
}

.duty-step-container {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
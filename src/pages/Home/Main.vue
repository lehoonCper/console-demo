<template>
    <div class="nav-container"
         :style="{backgroundImage: 'url(' + background_image_url + ')',  backgroundRepeat: 'round', backgroundSize: '100%, 100%',
        backgroundAttachment: 'fixed', backgroundColor: '#464646', backgroundColor: 'rgba(255, 255, 255, 0.8)'}">
        <CommonHeader />


        <div class="text-box">
            <span style="font-size: 12px; font-weight: bold;">"{{ background_image_describe }}"</span> -- 
            <span style="font-size: 12px;"> {{ background_image_copyright }}</span>
        </div>
    </div>
</template> 

<script>
import CommonHeader from '@/global_components/CommonHeader.vue';
export default {
    name: 'HomeView',
    components: {
        CommonHeader
    },


    data() {
        return {
            background_image_url: '',
            background_image_copyright: '',
            background_image_describe: '',
        }
    },

    async mounted() {
        console.log('import.meta.env.VITE_APP_ENV', import.meta.env.VITE_APP_ENV);
        try {
            const response = await this.$common.get("/background_image");
            this.background_image_url = response.data.url
            this.background_image_copyright = response.data.copy_right
            this.background_image_describe = response.data.title
        } catch (error) {
            console.error("Failed to fetch background image:", error);
            this.background_image_url = 'default_background_url.jpg';
        }
    }
};
</script>
  
  
<style scoped>
.nav-container {
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.8);
    position: relative;
}

.text-box {
    padding: 10px;
    position: absolute;
    bottom: 20px;
    right: 20px;
    background-color: rgba(64, 64, 64, 0.6);
    color: white;
    border-radius: 10px;
    user-select: none;
}
</style>
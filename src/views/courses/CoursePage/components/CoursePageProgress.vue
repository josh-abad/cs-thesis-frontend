<template>
  <AppPanel class="py-3 px-3">
    <AppLabel emphasis id="course-progress">Course Progress</AppLabel>
    <ProgressBar
      aria-labelledby="course-progress"
      class="mt-2"
      :percentage="percentage"
    />
  </AppPanel>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import AppLabel from '@/components/ui/AppLabel.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import coursesService from '@/services/courses'
import { useStore } from '@/store'

export default defineComponent({
  name: 'CoursePageProgress',
  components: { AppPanel, AppLabel, ProgressBar },
  props: {
    slug: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useStore()

    const coursePercentage = ref(0)
    const fetchCourseProgress = async () => {
      if (!store.state.user) {
        return
      }
      const { percentage } = await coursesService.getCourseProgressByUser(
        props.slug,
        store.state.user.id
      )
      coursePercentage.value = percentage
    }

    fetchCourseProgress()

    return {
      percentage: coursePercentage
    }
  }
})
</script>

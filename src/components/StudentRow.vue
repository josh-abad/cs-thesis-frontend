<template>
  <li class="flex items-center justify-between py-3">
    <div class="flex items-center">
      <Avatar class="w-10 h-10" :user="student" />
      <div class="ml-4">
        <router-link :to="`/user/${student.id}`">{{
          student.fullName
        }}</router-link>
      </div>
    </div>
    <button
      aria-label="Toggle Menu"
      class="relative focus:outline-none"
      @click="menuDropdown = !menuDropdown"
      :id="student.id"
    >
      <DotsVerticalIcon class="w-6 h-6 pointer-events-none fill-current" />
      <MenuDropdown
        class="mr-8 -mt-6"
        v-model="menuDropdown"
        :toggle-id="student.id"
      >
        <MenuDropdownItem :path="`/user/${student.id}`">
          <template #label> View Student </template>
        </MenuDropdownItem>
        <MenuDropdownItem
          :id="`${student.id}-grades-modal`"
          @item-click="studentGradesModal = true"
          v-if="
            courseSlug && $store.getters.permissions(['admin', 'coordinator'])
          "
        >
          <template #label> View Grades </template>
        </MenuDropdownItem>
        <MenuDropdownItem
          :id="`unenroll-${student.id}-modal`"
          @item-click="unenrollStudentModal = true"
          separator
          v-if="
            courseSlug && $store.getters.permissions(['admin', 'coordinator'])
          "
        >
          <template #label>
            <span class="text-red-500 dark:text-red-400">
              Un-Enroll From Course
            </span>
          </template>
        </MenuDropdownItem>
        <MenuDropdownItem
          :id="`delete-${student.id}-modal`"
          @item-click="deleteStudentModal = true"
          separator
          v-if="!courseSlug && $store.getters.permissions(['admin'])"
        >
          <template #label>
            <span class="text-red-500 dark:text-red-400">Delete Student</span>
          </template>
        </MenuDropdownItem>
      </MenuDropdown>
    </button>
    <teleport to="#modals">
      <AppModal
        :click-outside-id="`delete-${student.id}-modal`"
        v-model="deleteStudentModal"
      >
        <template #header> Delete Account </template>
        <template #body>
          Are you sure you want to delete this account?
        </template>
        <template #action>
          <AppButton @click="deleteStudent" prominent> Delete </AppButton>
        </template>
      </AppModal>
      <AppModal
        :click-outside-id="`unenroll-${student.id}-modal`"
        v-model="unenrollStudentModal"
      >
        <template #header> Un-Enroll Student </template>
        <template #body>
          Are you sure you want to unenroll this student from this course?
        </template>
        <template #action>
          <AppButton @click="unenrollStudent" prominent> Un-enroll </AppButton>
        </template>
      </AppModal>
      <AppModal
        :click-outside-id="`${student.id}-grades-modal`"
        v-model="studentGradesModal"
        v-if="courseSlug"
        class="w-[90%] sm:w-1/2 max-h-screen"
      >
        <template #header>Grades for {{ student.fullName }}</template>
        <template #body>
          <StudentGrades
            :on="studentGradesModal"
            :slug="courseSlug"
            :userId="student.id"
          />
        </template>
      </AppModal>
    </teleport>
  </li>
</template>

<script lang="ts">
import usersService from '@/services/users'
import { User } from '@/types'
import { defineComponent, PropType, ref } from 'vue'
import MenuDropdown from './MenuDropdown.vue'
import MenuDropdownItem from './MenuDropdownItem.vue'
import AppButton from './ui/AppButton.vue'
import Avatar from './Avatar.vue'
import AppModal from './ui/AppModal.vue'
import courses from '@/services/courses'
import { DotsVerticalIcon } from '@heroicons/vue/outline'
import useSnackbar from '@/composables/use-snackbar'
import NProgress from 'nprogress'
import StudentGrades from './StudentGrades.vue'

export default defineComponent({
  name: 'StudentRow',
  components: {
    AppButton,
    AppModal,
    MenuDropdown,
    MenuDropdownItem,
    Avatar,
    DotsVerticalIcon,
    StudentGrades
  },
  props: {
    student: {
      type: Object as PropType<User>,
      required: true
    },

    courseSlug: {
      type: String,
      required: false
    }
  },
  emit: ['delete-student'],
  setup() {
    const { setSnackbarMessage } = useSnackbar()

    const deleteStudentModal = ref(false)
    const unenrollStudentModal = ref(false)
    const studentGradesModal = ref(false)
    const menuDropdown = ref(false)

    return {
      setSnackbarMessage,
      deleteStudentModal,
      unenrollStudentModal,
      studentGradesModal,
      menuDropdown
    }
  },
  methods: {
    async deleteStudent() {
      this.deleteStudentModal = false
      try {
        NProgress.start()
        await usersService.deleteUser(this.student.id)
        this.setSnackbarMessage('Student removed', 'success')
        this.$emit('delete-student')
      } catch (error) {
        this.setSnackbarMessage('Could not delete student.', 'error')
      } finally {
        NProgress.done()
      }
    },
    async unenrollStudent() {
      this.unenrollStudentModal = false
      if (this.courseSlug) {
        try {
          NProgress.start()
          await courses.unenrollUser(this.courseSlug, this.student.id)
          this.setSnackbarMessage('Student un-enrolled from course.', 'success')
          this.$emit('delete-student')
        } catch (error) {
          this.setSnackbarMessage('Could not un-enroll student.', 'error')
        } finally {
          NProgress.done()
        }
      }
    }
  }
})
</script>

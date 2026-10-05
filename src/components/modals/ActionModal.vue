<template>
  <Modal class="action-modal" @close="cancel">
    <h3>{{ title }}</h3>
    <p v-if="message">{{ message }}</p>
    <label v-if="input" class="input-label" :for="inputId">{{ label }}</label>
    <input
      v-if="input"
      :id="inputId"
      ref="input"
      v-model="value"
      :placeholder="placeholder"
      @keyup.enter="submit"
    />
    <div class="button-group">
      <div class="button" @click="cancel">Cancel</div>
      <div class="button townsfolk" @click="submit">{{ confirmText }}</div>
    </div>
  </Modal>
</template>

<script>
import Modal from "./Modal";

export default {
  components: { Modal },
  props: {
    title: { type: String, required: true },
    message: { type: String, default: "" },
    label: { type: String, default: "" },
    initialValue: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    confirmText: { type: String, default: "Confirm" },
    input: { type: Boolean, default: true },
  },
  data() {
    return {
      value: this.initialValue,
      inputId: `action-input-${Math.random().toString(36).slice(2)}`,
    };
  },
  mounted() {
    if (this.input) this.$refs.input.focus();
  },
  methods: {
    cancel() {
      this.$emit("cancel");
    },
    submit() {
      this.$emit("submit", this.value);
    },
  },
};
</script>

<style scoped lang="scss">
.action-modal {
  text-align: center;
  min-width: min(420px, 90vw);

  p {
    margin: 10px 0;
  }

  .input-label {
    display: block;
    text-align: left;
    margin: 12px 0 4px;
  }

  input {
    width: 100%;
    padding: 8px 10px;
    border: 2px solid #555;
    border-radius: 4px;
    background: #171717;
    color: white;
    font: inherit;
  }

  .button-group {
    margin-top: 12px;
  }
}
</style>

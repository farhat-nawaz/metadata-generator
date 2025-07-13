document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const dataForm = document.getElementById("dataForm");
  const promptsContainer = document.getElementById("prompts-container");
  const addPromptButton = document.getElementById("addPrompt");
  const resetFormButton = document.getElementById("resetForm");
  const viewJsonButton = document.getElementById("viewJson");
  const generateUUIDButton = document.getElementById("generateUUID");
  const jsonModal = document.getElementById("jsonModal");
  const jsonOutput = document.getElementById("jsonOutput");
  const closeModalButton = document.getElementById("closeModal");
  const copyJsonButton = document.getElementById("copyJson");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  let promptCount = 1;

  // Function to generate UUID
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  // Function to show toast
  function showToast(message, type = "success") {
    toastMessage.textContent = message;
    toast.classList.remove("hidden", "bg-green-600", "bg-red-600");

    if (type === "success") {
      toast.classList.add("bg-green-600");
    } else {
      toast.classList.add("bg-red-600");
    }

    toast.classList.remove("hidden");

    // Auto-hide after 3 seconds
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3000);
  }

  // Add new prompt
  addPromptButton.addEventListener("click", function () {
    promptCount++;

    const promptTemplate = promptsContainer
      .querySelector(".prompt-item")
      .cloneNode(true);
    const promptHeader = promptTemplate.querySelector("h3");
    promptHeader.textContent = `Prompt #${promptCount}`;

    // Update input names to have the correct index
    const inputs = promptTemplate.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      if (input.name) {
        input.name = input.name.replace(
          /prompts\[\d+\]/,
          `prompts[${promptCount - 1}]`,
        );
        input.value = ""; // Clear value except for defaults
      }
    });

    // Set default values
    promptTemplate.querySelector(
      'input[name$="[response_time_seconds]"]',
    ).value = "1";
    promptTemplate.querySelector('input[name$="[choice]"]').value = "0";
    promptTemplate.querySelector(
      'input[name$="[level_of_correctness]"]',
    ).value = "-1";
    promptTemplate.querySelector('input[name$="[build_creator]"]').value =
      "default";

    // Add remove handler
    const removeButton = promptTemplate.querySelector(".remove-prompt");
    removeButton.addEventListener("click", function () {
      promptTemplate.remove();
      updatePromptNumbers();
    });

    promptsContainer.appendChild(promptTemplate);
  });

  // Remove prompt
  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("remove-prompt") ||
      e.target.closest(".remove-prompt")
    ) {
      const promptItem = e.target.closest(".prompt-item");

      // Don't remove if it's the only prompt
      if (promptsContainer.querySelectorAll(".prompt-item").length > 1) {
        promptItem.remove();
        updatePromptNumbers();
      } else {
        showToast("Cannot remove the only prompt", "error");
      }
    }
  });

  // Update prompt numbers
  function updatePromptNumbers() {
    const promptItems = promptsContainer.querySelectorAll(".prompt-item");
    promptItems.forEach((item, index) => {
      const promptHeader = item.querySelector("h3");
      promptHeader.textContent = `Prompt #${index + 1}`;

      const inputs = item.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        if (input.name) {
          input.name = input.name.replace(
            /prompts\[\d+\]/,
            `prompts[${index}]`,
          );
        }
      });
    });

    promptCount = promptItems.length;
  }

  // Generate UUID
  generateUUIDButton.addEventListener("click", function () {
    document.getElementById("uuid").value = generateUUID();
  });

  // Form submit handler
  dataForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = getFormData();
    console.log("Form submitted:", formData);
    showToast("Form submitted successfully!");
  });

  // View JSON button handler
  viewJsonButton.addEventListener("click", function () {
    const formData = getFormData();
    jsonOutput.textContent = JSON.stringify(formData, null, 2);
    jsonModal.classList.remove("hidden");
  });

  // Close modal button handler
  closeModalButton.addEventListener("click", function () {
    jsonModal.classList.add("hidden");
  });

  // Close modal when clicking outside
  jsonModal.addEventListener("click", function (e) {
    if (e.target === jsonModal) {
      jsonModal.classList.add("hidden");
    }
  });

  // Copy JSON button handler
  copyJsonButton.addEventListener("click", function () {
    const jsonText = jsonOutput.textContent;
    navigator.clipboard
      .writeText(jsonText)
      .then(() => {
        showToast("JSON copied to clipboard!");
      })
      .catch(() => {
        showToast("Failed to copy JSON", "error");
      });
  });

  // Reset form button handler
  resetFormButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to reset the form?")) {
      dataForm.reset();

      // Remove extra prompts
      const promptItems = promptsContainer.querySelectorAll(".prompt-item");
      for (let i = promptItems.length - 1; i > 0; i--) {
        promptItems[i].remove();
      }

      promptCount = 1;
      updatePromptNumbers();
      showToast("Form has been reset");
    }
  });

  // Function to get form data as JSON
  function getFormData() {
    const formData = {
      uuid: document.getElementById("uuid").value,
      hfi_id: document.getElementById("hfi_id").value,
      language: document.getElementById("language").value,
      interface: document.getElementById("interface").value,
      starting_commit__hash: document.getElementById("starting_commit__hash")
        .value,
      jira: document.getElementById("jira").value,
      root_gdrive: document.getElementById("root_gdrive").value,
      repo: {
        repo_link: document.getElementById("repo_link").value,
        codebase_category: document.getElementById("codebase_category").value,
        repo_type: document.getElementById("repo_type").value,
      },
      prompts: [],
    };

    // Get prompt data
    const promptItems = promptsContainer.querySelectorAll(".prompt-item");
    promptItems.forEach((item, index) => {
      const promptData = {
        prompt: item.querySelector('textarea[name$="[prompt]"]').value,
        response_time_seconds:
          parseInt(
            item.querySelector('input[name$="[response_time_seconds]"]').value,
          ) || 1,
        pdf_link: item.querySelector('input[name$="[pdf_link]"]').value,
        final_codebase_link: item.querySelector(
          'input[name$="[final_codebase_link]"]',
        ).value,
        usecase: item.querySelector('select[name$="[usecase]"]').value,
        issue_type: item.querySelector('select[name$="[issue_type]"]').value,
        choice:
          parseInt(item.querySelector('input[name$="[choice]"]').value) || 0,
        level_of_correctness:
          parseInt(
            item.querySelector('input[name$="[level_of_correctness]"]').value,
          ) || -1,
        build_creator:
          item.querySelector('input[name$="[build_creator]"]').value ||
          "default",
        comment: item.querySelector('input[name$="[comment]"]').value,
      };

      formData.prompts.push(promptData);
    });

    return formData;
  }
});

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
  const toggleAllPromptsButton = document.getElementById("toggleAllPrompts");
  const toggleAllText = document.getElementById("toggleAllText");

  let promptCount = 1;
  let allCollapsed = false;

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

  // Function to toggle prompt collapse
  function togglePromptCollapse(promptItem) {
    const promptContent = promptItem.querySelector(".prompt-content");
    const collapseIcon = promptItem.querySelector(".collapse-icon");

    if (promptContent.classList.contains("collapsed")) {
      // Expand
      promptContent.classList.remove("collapsed");
      promptContent.classList.add("expanded");
      collapseIcon.classList.remove("rotated");
    } else {
      // Collapse
      promptContent.classList.remove("expanded");
      promptContent.classList.add("collapsed");
      collapseIcon.classList.add("rotated");
    }
  }

  // Function to update prompt preview
  function updatePromptPreview(promptItem) {
    const promptTextInput = promptItem.querySelector(".prompt-text-input");
    const promptPreview = promptItem.querySelector(".prompt-preview");

    if (promptTextInput && promptPreview) {
      const text = promptTextInput.value.trim();
      if (text) {
        // Show first 50 characters of the prompt
        const preview = text.length > 50 ? text.substring(0, 50) + "..." : text;
        promptPreview.textContent = `"${preview}"`;
      } else {
        promptPreview.textContent = "";
      }
    }
  }

  // Function to setup prompt item event listeners
  function setupPromptItem(promptItem) {
    // Add click handler for header
    const promptHeader = promptItem.querySelector(".prompt-header");
    promptHeader.addEventListener("click", function (e) {
      // Don't toggle if clicking on remove button
      if (!e.target.closest(".remove-prompt")) {
        togglePromptCollapse(promptItem);
      }
    });

    // Add input listener for prompt text to update preview
    const promptTextInput = promptItem.querySelector(".prompt-text-input");
    if (promptTextInput) {
      promptTextInput.addEventListener("input", function () {
        updatePromptPreview(promptItem);
      });
    }

    // Add remove handler
    const removeButton = promptItem.querySelector(".remove-prompt");
    removeButton.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent header click event

      // Don't remove if it's the only prompt
      if (promptsContainer.querySelectorAll(".prompt-item").length > 1) {
        promptItem.remove();
        updatePromptNumbers();
      } else {
        showToast("Cannot remove the only prompt", "error");
      }
    });
  }

  // Initialize first prompt
  const firstPrompt = promptsContainer.querySelector(".prompt-item");
  if (firstPrompt) {
    setupPromptItem(firstPrompt);
  }

  // Toggle all prompts
  toggleAllPromptsButton.addEventListener("click", function () {
    const promptItems = promptsContainer.querySelectorAll(".prompt-item");

    allCollapsed = !allCollapsed;

    promptItems.forEach((item) => {
      const promptContent = item.querySelector(".prompt-content");
      const collapseIcon = item.querySelector(".collapse-icon");

      if (allCollapsed) {
        promptContent.classList.remove("expanded");
        promptContent.classList.add("collapsed");
        collapseIcon.classList.add("rotated");
      } else {
        promptContent.classList.remove("collapsed");
        promptContent.classList.add("expanded");
        collapseIcon.classList.remove("rotated");
      }
    });

    // Update button text and icon
    if (allCollapsed) {
      toggleAllText.textContent = "Expand All";
      toggleAllPromptsButton.innerHTML =
        '<i class="fas fa-expand-arrows-alt mr-1"></i> <span id="toggleAllText">Expand All</span>';
    } else {
      toggleAllText.textContent = "Collapse All";
      toggleAllPromptsButton.innerHTML =
        '<i class="fas fa-compress-arrows-alt mr-1"></i> <span id="toggleAllText">Collapse All</span>';
    }
  });

  // Add new prompt
  addPromptButton.addEventListener("click", function () {
    promptCount++;

    const promptTemplate = promptsContainer
      .querySelector(".prompt-item")
      .cloneNode(true);

    // Update prompt number
    const promptHeader = promptTemplate.querySelector("h3");
    promptHeader.textContent = `Prompt #${promptCount}`;

    // Clear preview
    const promptPreview = promptTemplate.querySelector(".prompt-preview");
    if (promptPreview) {
      promptPreview.textContent = "";
    }

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
    promptTemplate.querySelector('select[name$="[choice]"]').value = "0";
    promptTemplate.querySelector('select[name$="[code_logic_rating]"]').value =
      "-1";
    promptTemplate.querySelector(
      'select[name$="[naming_clarity_rating]"]',
    ).value = "-1";
    promptTemplate.querySelector(
      'select[name$="[organization_modularity_rating]"]',
    ).value = "-1";
    promptTemplate.querySelector(
      'select[name$="[interface_design_rating]"]',
    ).value = "-1";
    promptTemplate.querySelector(
      'select[name$="[error_handling_rating]"]',
    ).value = "-1";
    promptTemplate.querySelector(
      'select[name$="[documentation_rating]"]',
    ).value = "-1";
    promptTemplate.querySelector(
      'select[name$="[review_readiness_rating]"]',
    ).value = "-1";
    promptTemplate.querySelector(
      'select[name$="[level_of_correctness]"]',
    ).value = "-1";

    // Ensure new prompt is expanded
    const promptContent = promptTemplate.querySelector(".prompt-content");
    const collapseIcon = promptTemplate.querySelector(".collapse-icon");
    promptContent.classList.remove("collapsed");
    promptContent.classList.add("expanded");
    collapseIcon.classList.remove("rotated");

    // Setup event listeners for the new prompt
    setupPromptItem(promptTemplate);

    promptsContainer.appendChild(promptTemplate);

    // Scroll to the new prompt
    promptTemplate.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

      // Reset first prompt's preview
      const firstPrompt = promptsContainer.querySelector(".prompt-item");
      if (firstPrompt) {
        const promptPreview = firstPrompt.querySelector(".prompt-preview");
        if (promptPreview) {
          promptPreview.textContent = "";
        }

        // Ensure first prompt is expanded
        const promptContent = firstPrompt.querySelector(".prompt-content");
        const collapseIcon = firstPrompt.querySelector(".collapse-icon");
        promptContent.classList.remove("collapsed");
        promptContent.classList.add("expanded");
        collapseIcon.classList.remove("rotated");
      }

      promptCount = 1;
      updatePromptNumbers();

      // Reset toggle all button state
      allCollapsed = false;
      toggleAllPromptsButton.innerHTML =
        '<i class="fas fa-compress-arrows-alt mr-1"></i> <span id="toggleAllText">Collapse All</span>';

      showToast("Form has been reset");
    }
  });

  // Function to get form data as JSON
  function getFormData() {
    const interfaces = {
      rust: "pr_writer_rust_v2",
      python: "pr_writer_v2",
      javascript: "pr_writer_javascript_v2",
    };

    const language = document.getElementById("language").value;
    const formData = {
      uuid: document.getElementById("uuid").value,
      hfi_id: document.getElementById("hfi_id").value,
      task_type: document.getElementById("task_type").value,
      language: language,
      interface: interfaces[language],
      starting_commit_hash: document.getElementById("starting_commit__hash")
        .value,
      jira: document.getElementById("jira").value,
      root_gdrive: document.getElementById("root_gdrive").value,
      final_codebase_link: document.getElementById("final_codebase_link").value,
      worker_id: document.getElementById("worker_id").value,
      build_creator:
        document.getElementById("build_creator").value || "default",
      usecase: document.getElementById("usecase").value,
      repo: {
        repo_link: document.getElementById("repo_link").value,
        codebase_category: document.getElementById("codebase_category").value,
        repo_type: document.getElementById("repo_type").value,
      },
      final_comment: {
        pros: document.getElementById("final_comment_pros").value,
        cons: document.getElementById("final_comment_cons").value,
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
        output_files_link: item.querySelector(
          'input[name$="[output_files_link]"]',
        ).value,
        issue_type: item.querySelector('select[name$="[issue_type]"]').value,
        choices: {
          interaction_rating:
            parseInt(item.querySelector('select[name$="[choice]"]').value) || 0,
          code_logic:
            parseInt(
              item.querySelector('select[name$="[code_logic_rating]"]').value,
            ) || -1,
          naming_clarity:
            parseInt(
              item.querySelector('select[name$="[naming_clarity_rating]"]')
                .value,
            ) || -1,
          organization_modularity:
            parseInt(
              item.querySelector(
                'select[name$="[organization_modularity_rating]"]',
              ).value,
            ) || -1,
          interface_design:
            parseInt(
              item.querySelector('select[name$="[interface_design_rating]"]')
                .value,
            ) || -1,
          error_handling:
            parseInt(
              item.querySelector('select[name$="[error_handling_rating]"]')
                .value,
            ) || -1,
          documentation:
            parseInt(
              item.querySelector('select[name$="[documentation_rating]"]')
                .value,
            ) || -1,
          review_readiness:
            parseInt(
              item.querySelector('select[name$="[review_readiness_rating]"]')
                .value,
            ) || -1,
        },
        level_of_correctness:
          parseInt(
            item.querySelector('select[name$="[level_of_correctness]"]').value,
          ) || -1,
        comment: item.querySelector('textarea[name$="[comment]"]').value,
      };

      formData.prompts.push(promptData);
    });

    return formData;
  }
});

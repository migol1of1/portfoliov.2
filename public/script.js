// page/nav transitions
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main");

  function showSection(id) {
    sections.forEach((section) => {
      if (section.id === id) {
        section.style.display = "flex";

        setTimeout(() => {
          section.classList.add("active");
        }, 10);
      } else {
        section.classList.remove("active");

        setTimeout(() => {
          if (!section.classList.contains("active")) {
            section.style.display = "none";
          }
        }, 200);
      }
    });
  }

  window.showSection = showSection;

  let lastIndex = 0;

  window.activateProjectsSection = function () {
    showSection("projects");

    const projectsNav = document.querySelector('a[href="#projects"]');
    if (projectsNav) {
      navLinks.forEach((l) => {
        l.classList.remove("active", "text-blue-900", "font-semibold");
        l.querySelector("span").classList.remove("scale-x-100");
      });

      projectsNav.classList.add("active", "text-blue-900", "font-semibold");

      const underline = projectsNav.querySelector("span");
      const currentIndex = Array.from(navLinks).indexOf(projectsNav);

      if (currentIndex > lastIndex) {
        underline.style.setProperty("--underline-origin", "left");
      } else {
        underline.style.setProperty("--underline-origin", "right");
      }

      underline.classList.add("scale-x-100");
      lastIndex = currentIndex;
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);

      const targetSection = document.getElementById(targetId);
      if (!targetSection.classList.contains("active")) {
        showSection(targetId);

        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  });

  sections.forEach((section) => {
    section.style.display = "flex";
  });

  const aboutSection = document.getElementById("about");
  aboutSection.classList.add("active");

  const aboutNav = document.querySelector('a[href="#about"]');
  if (aboutNav) {
    aboutNav.classList.add("active");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link");
  let lastIndex = 0;

  links.forEach((link, index) => {
    const underline = link.querySelector("span");

    link.addEventListener("click", (e) => {
      e.preventDefault();

      links.forEach((l) => {
        l.classList.remove("text-blue-900", "font-semibold");
        l.querySelector("span").classList.remove("scale-x-100");
      });

      link.classList.add("text-blue-900", "font-semibold");
      underline.classList.add("scale-x-100");

      if (index > lastIndex) {
        underline.style.setProperty("--underline-origin", "left");
      } else {
        underline.style.setProperty("--underline-origin", "right");
      }

      lastIndex = index;
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openPdfModal");
  const closeBtn = document.getElementById("closePdfModal");
  const pdfModal = document.getElementById("pdfModal");

  openBtn.addEventListener("click", () => {
    pdfModal.classList.remove("hidden");
    pdfModal.classList.add("flex");
  });

  closeBtn.addEventListener("click", () => {
    pdfModal.classList.add("hidden");
    pdfModal.classList.remove("flex");
  });

  window.addEventListener("click", (e) => {
    if (e.target === pdfModal) {
      pdfModal.classList.add("hidden");
      pdfModal.classList.remove("flex");
    }
  });
});

//profile section
document.addEventListener("DOMContentLoaded", () => {
  const sections = [
    {
      element: document.getElementById("personalContent"),
      title: "Get to Know More About Me",
    },
    {
      element: document.getElementById("educationContent"),
      title: "My Educational Background",
    },
    {
      element: document.getElementById("certificationsContent"),
      title: "My Certifications",
    },
  ];

  let currentIndex = 0;
  let isTransitioning = false;
  let typingInProgress = false;

  const btnPrev = document.getElementById("btnPersonal");
  const btnNext = document.getElementById("btnProfile");

  function typeText(element, text, speed = 50) {
    return new Promise((resolve) => {
      typingInProgress = true;

      const originalHeight = element.offsetHeight;
      element.style.minHeight = originalHeight + "px";

      element.textContent = "";
      let i = 0;

      const typeTimer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(typeTimer);

          setTimeout(() => {
            element.style.minHeight = "";
            typingInProgress = false;
            resolve();
          }, 100);
        }
      }, speed);
    });
  }

  function deleteText(element, speed = 25) {
    return new Promise((resolve) => {
      typingInProgress = true;
      const text = element.textContent;
      let i = text.length;

      element.style.minHeight = element.offsetHeight + "px";

      const deleteTimer = setInterval(() => {
        if (i > 0) {
          element.textContent = text.substring(0, i - 1);
          i--;
        } else {
          clearInterval(deleteTimer);

          element.textContent = "";
          typingInProgress = false;
          resolve();
        }
      }, speed);
    });
  }

  async function showSection(index) {
    if (isTransitioning) return;

    isTransitioning = true;
    const currentSection = sections.find(
      (section) => !section.element.classList.contains("hidden")
    );
    const targetSection = sections[index];

    if (currentSection === targetSection) {
      isTransitioning = false;
      return;
    }

    if (currentSection) {
      const currentH2 = currentSection.element.querySelector("h2");
      const targetH2 = targetSection.element.querySelector("h2");

      const deletePromise = currentH2
        ? deleteText(currentH2)
        : Promise.resolve();

      const currentContent = currentSection.element.children;
      const contentElements = Array.from(currentContent).filter(
        (el) => el.tagName !== "H2"
      );

      contentElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(-10px)";
        el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      });

      const fadeoutPromise = new Promise((resolve) => setTimeout(resolve, 400));
      await Promise.all([deletePromise, fadeoutPromise]);

      currentSection.element.classList.add("hidden");
      currentSection.element.classList.remove("fade-in");

      targetSection.element.classList.remove("hidden");

      const targetContent = targetSection.element.children;
      const targetContentElements = Array.from(targetContent).filter(
        (el) => el.tagName !== "H2"
      );

      targetContentElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(10px)";
        el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      });

      if (targetH2) {
        targetH2.textContent = targetSection.title;
        const targetHeight = targetH2.offsetHeight;
        targetH2.style.minHeight = targetHeight + "px";
        targetH2.textContent = "";
      }

      targetSection.element.offsetHeight;

      setTimeout(async () => {
        targetSection.element.classList.add("fade-in");

        const typingPromise = targetH2
          ? typeText(targetH2, targetSection.title)
          : Promise.resolve();

        targetContentElements.forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        });

        await typingPromise;

        setTimeout(() => {
          [...contentElements, ...targetContentElements].forEach((el) => {
            el.style.opacity = "";
            el.style.transform = "";
            el.style.transition = "";
          });
          isTransitioning = false;
        }, 100);
      }, 50);
    } else {
      targetSection.element.classList.remove("hidden");

      const targetContent = targetSection.element.children;
      const targetContentElements = Array.from(targetContent).filter(
        (el) => el.tagName !== "H2"
      );

      targetContentElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(10px)";
        el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      });

      setTimeout(async () => {
        targetSection.element.classList.add("fade-in");

        const targetH2 = targetSection.element.querySelector("h2");
        if (targetH2) {
          targetH2.textContent = targetSection.title;
          const height = targetH2.offsetHeight;
          targetH2.style.minHeight = height + "px";
          targetH2.textContent = "";
        }

        const typingPromise = targetH2
          ? typeText(targetH2, targetSection.title)
          : Promise.resolve();

        targetContentElements.forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        });

        await typingPromise;

        setTimeout(() => {
          targetContentElements.forEach((el) => {
            el.style.opacity = "";
            el.style.transform = "";
            el.style.transition = "";
          });
          isTransitioning = false;
        }, 100);
      }, 50);
    }
  }

  btnNext.addEventListener("click", () => {
    if (!isTransitioning && !typingInProgress) {
      currentIndex = (currentIndex + 1) % sections.length;
      showSection(currentIndex);
      updateButtonText();
    }
  });

  btnPrev.addEventListener("click", () => {
    if (!isTransitioning && !typingInProgress) {
      currentIndex = (currentIndex - 1 + sections.length) % sections.length;
      showSection(currentIndex);
      updateButtonText();
    }
  });

  showSection(currentIndex);
});

//skills section
const skillTitle = document.getElementById("skill-title");
const skillItems = document.querySelectorAll("[data-skill]");

skillItems.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    skillTitle.textContent = item.getAttribute("data-skill");
    skillTitle.classList.remove("opacity-0");
    skillTitle.classList.add("opacity-100");
  });
  item.addEventListener("mouseleave", () => {
    skillTitle.classList.remove("opacity-100");
    skillTitle.classList.add("opacity-0");
  });
});

//projects section
const introContent = document.getElementById("introContent");
const wlsContent = document.getElementById("wlsContent");
const stbContent = document.getElementById("stbContent");
const btContent = document.getElementById("btContent");
const rpiContent = document.getElementById("rpiContent");

const buttonContainer = document.querySelector(".grid");
const projectsTitle = document.getElementById("projectsTitle");

const projectMap = {
  btnProject1: wlsContent,
  btnProject2: stbContent,
  btnProject3: btContent,
  btnProject4: rpiContent,
};

let isTransitioning = false;
function startTransition() {
  isTransitioning = true;
  setTimeout(() => {
    isTransitioning = false;
  }, 800);
}

function hideAllContent() {
  [introContent, wlsContent, stbContent, btContent, rpiContent].forEach(
    (content) => {
      if (!content.classList.contains("hidden")) {
        content.classList.remove("opacity-100");
        content.classList.add("opacity-0");
        setTimeout(() => {
          content.classList.add("hidden");
        }, 700);
      }
    }
  );
}

function hideButtons() {
  if (!buttonContainer.classList.contains("hidden")) {
    buttonContainer.classList.remove("opacity-100");
    buttonContainer.classList.add("opacity-0");
    setTimeout(() => {
      buttonContainer.classList.add("hidden");
    }, 700);
  }
}

function showButtons() {
  setTimeout(() => {
    buttonContainer.classList.remove("hidden");
    setTimeout(() => {
      buttonContainer.classList.remove("opacity-0");
      buttonContainer.classList.add("opacity-100");
    }, 50);
  }, 700);
}

function showProjectsTitle() {
  setTimeout(() => {
    projectsTitle.classList.remove("hidden");
    setTimeout(() => {
      projectsTitle.classList.remove("opacity-0");
      projectsTitle.classList.add("opacity-100");
    }, 50);
  }, 700);
}

function showContent(targetContent) {
  setTimeout(() => {
    targetContent.classList.remove("hidden");
    setTimeout(() => {
      targetContent.classList.remove("opacity-0");
      targetContent.classList.add("opacity-100");
    }, 50);
  }, 700);
}

function resetButtonStyles() {
  Object.keys(projectMap).forEach((id) => {
    const button = document.getElementById(id);
    if (button) {
      button.classList.remove("bg-blue-100", "border-blue-400");
      button.classList.add("hover:bg-blue-50");
    }
  });
}

function setActiveButton(button) {
  resetButtonStyles();
  if (button) {
    button.classList.add("bg-blue-100", "border-blue-400");
    button.classList.remove("hover:bg-blue-50");
  }
}

const mainImage = document.getElementById("main-project-image");
const defaultMainImageSrc = mainImage ? mainImage.src : "";
let lastBlankThumbnail = null;

function swapImages(clickedThumbnail) {
  if (mainImage && clickedThumbnail) {
    mainImage.style.transition = "opacity 0.3s ease";
    mainImage.style.opacity = "0";

    setTimeout(() => {
      if (lastBlankThumbnail && lastBlankThumbnail !== clickedThumbnail) {
        const originalSrc = lastBlankThumbnail.getAttribute("data-original");
        if (originalSrc) {
          lastBlankThumbnail.src = originalSrc;
          lastBlankThumbnail.classList.remove(
            "pointer-events-none",
            "opacity-0"
          );
        }
      }

      const newMainSrc = clickedThumbnail.src;
      mainImage.src = newMainSrc;

      if (!clickedThumbnail.getAttribute("data-original")) {
        clickedThumbnail.setAttribute("data-original", newMainSrc);
      }

      clickedThumbnail.src = "";
      clickedThumbnail.classList.add("pointer-events-none", "opacity-0");
      lastBlankThumbnail = clickedThumbnail;

      setTimeout(() => {
        mainImage.style.opacity = "1";
      }, 50);
    }, 300);
  }
}

function resetMainImage() {
  if (mainImage) {
    mainImage.style.transition = "opacity 0.3s ease";
    mainImage.style.opacity = "0";

    setTimeout(() => {
      mainImage.src = defaultMainImageSrc;

      setTimeout(() => {
        mainImage.style.opacity = "1";
      }, 50);
    }, 300);
  }

  if (lastBlankThumbnail) {
    const originalSrc = lastBlankThumbnail.getAttribute("data-original");
    if (originalSrc) {
      lastBlankThumbnail.src = originalSrc;
      lastBlankThumbnail.classList.remove("pointer-events-none", "opacity-0");
    }
    lastBlankThumbnail = null;
  }
}

function returnToIntro() {
  if (isTransitioning) return;
  startTransition();
  hideAllContent();
  showContent(introContent);
  showButtons();
  showProjectsTitle();
  resetButtonStyles();
  resetMainImage();
}

buttonContainer.addEventListener("click", (e) => {
  if (isTransitioning) return;
  const button = e.target.closest("button");
  if (button && projectMap[button.id]) {
    startTransition();
    const targetContent = projectMap[button.id];
    hideAllContent();
    hideButtons();
    showContent(targetContent);
    setActiveButton(button);
  }
});

document.addEventListener("click", (e) => {
  if (isTransitioning) return;

  if (e.target.classList.contains("thumbnail-image")) {
    startTransition();
    const projectId = e.target.getAttribute("data-project");
    if (projectId) {
      swapImages(e.target);
      const targetContent = document.getElementById(projectId);
      if (targetContent) {
        hideAllContent();
        showContent(targetContent);
        const buttonId = Object.keys(projectMap).find(
          (key) => projectMap[key] === targetContent
        );
        if (buttonId) {
          const button = document.getElementById(buttonId);
          if (button) {
            setActiveButton(button);
          }
        }
      }
    }
    return;
  }

  if (e.target.closest(".back-to-projects")) {
    returnToIntro();
    return;
  }
});

//contact section
const messageTextarea = document.getElementById("message");
const charCount = document.getElementById("charCount");

messageTextarea.addEventListener("input", function () {
  const currentLength = this.value.length;
  charCount.textContent = `${currentLength}/500`;

  if (currentLength > 450) {
    charCount.classList.add("text-red-400");
    charCount.classList.remove("text-gray-400");
  } else {
    charCount.classList.add("text-gray-400");
    charCount.classList.remove("text-red-400");
  }
});

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

contactForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const message = formData.get("message");

  if (!name || !email || !message) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }

  const submitButton = this.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;

  submitButton.textContent = "Sending...";
  submitButton.disabled = true;

  try {
    const response = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        message: message,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      showMessage(result.message || "Message sent successfully!", "success");
      this.reset();
      charCount.textContent = "0/500";
    } else {
      showMessage(
        result.error || "Failed to send message. Please try again.",
        "error"
      );
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("Please check your connection and try again.", "error");
  } finally {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
});

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `p-4 rounded-lg text-center font-medium ${
    type === "success"
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-red-100 text-red-800 border border-red-200"
  }`;
  formMessage.classList.remove("hidden");

  setTimeout(() => {
    formMessage.classList.add("hidden");
  }, 5000);
}

const phoneInput = document.getElementById("phone");
phoneInput.addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.startsWith("63")) {
    value = "+" + value;
  } else if (value.startsWith("0")) {
    value = "+63" + value.substring(1);
  } else if (value.length > 0 && !value.startsWith("+")) {
    value = "+63" + value;
  }
  e.target.value = value;
});

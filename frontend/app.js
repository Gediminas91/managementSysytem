function displayMemberships(data) {
  const membership = document.querySelector(".memberships");

  membership.innerHTML = "";

  data.forEach((member) => {
    const subDiv = document.createElement("div");
    subDiv.classList.add("membership");

    const membersDiv = document.createElement("div");
    membersDiv.classList.add("membersship-heading");

    const heading = document.createElement("h3");
    heading.textContent = `$${member.price} ${member.name}`;

    const text = document.createElement("p");
    text.textContent = `${member.description}`;

    const deleteBtn = document.createElement("div");
    deleteBtn.classList.add("delete-btn");

    const icon = document.createElement("i");
    icon.classList.add("fa", "fa-trash", "btn");
    icon.dataset.id = member._id;

    deleteBtn.appendChild(icon);
    membersDiv.append(heading, text);
    subDiv.append(membersDiv, deleteBtn);
    membership.appendChild(subDiv);
  });
}

function displayUsers(data) {
  const users = document.querySelector(".all-users");

  users.innerHTML = "";

  data.forEach((user) => {
    const userDiv = document.createElement("div");
    userDiv.classList.add("user");

    const heading = document.createElement("h4");
    heading.textContent = `${user.name} ${user.surname}`;

    const textDiv = document.createElement("div");
    textDiv.classList.add("user-data");

    const text1 = document.createElement("p");
    text1.textContent = `Email Address: `;
    const text1Span = document.createElement("span");
    text1Span.textContent = `${user.email}`;

    const text2 = document.createElement("p");
    text2.textContent = `Membership: `;
    const text2Span = document.createElement("span");
    text2Span.textContent = `${user.membership}`;

    const text3 = document.createElement("p");

    text3.textContent = `Ip: ${generateRandomNum()}`;

    text1.appendChild(text1Span);
    text2.appendChild(text2Span);
    textDiv.append(text1, text2, text3);
    userDiv.append(heading, textDiv);
    users.appendChild(userDiv);
  });
}

const generateRandomNum = () => {
  const octet1 = Math.floor(Math.random() * 256);
  const octet2 = Math.floor(Math.random() * 256);
  const octet3 = Math.floor(Math.random() * 256);
  const octet4 = Math.floor(Math.random() * 256);

  return `${octet1}.${octet2}.${octet3}.${octet4}`;
};

async function getMemberships() {
  try {
    const response = await fetch("http://localhost:3000/memberships");
    const data = await response.json();
    displayMemberships(data);
    deleteMembership();
  } catch (error) {
    console.error("Error fetching memberships:", error);
  }
}

// let isAscending = true;

async function getUsers() {
  try {
    const response = await fetch(`http://localhost:3000/users`);
    const data = await response.json();
    displayUsers(data);
  } catch (error) {
    console.error("Error fetching memberships:", error);
  }
}

function displayData() {
  // getMemberships();
  getUsers();
}

displayData();

// const sort = document.querySelector("h3");

// sort.addEventListener("click", () => {
//   const order = isAscending ? "asc" : "dsc";
//   getUsers(order);
//   isAscending = !isAscending;
// });

async function postMemberships() {
  const form = document.querySelector("form");
  const cancelBtn = document.querySelector(".cancel-btn");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const membership = document.getElementById("membership").value;
    const description = document.getElementById("description").value;

    try {
      const response = await fetch("http://localhost:3000/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, price: membership, description }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("membership added successfully!");
        form.reset();
      } else {
        alert(`Failed to add membership: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the membership.");
    }
  });

  cancelBtn.addEventListener("click", () => {
    window.location.href = "./members.html";
  });
}

postMemberships();

async function deleteMembership() {
  const deleteButtons = document.querySelectorAll(".btn");

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      const membershipId = event.target.dataset.id;

      try {
        const response = await fetch(
          `http://localhost:3000/memberships/${membershipId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          const updatedMemberships = await fetch(
            "http://localhost:3000/memberships"
          ).then((res) => res.json());
          displayMemberships(updatedMemberships);
        } else {
          const result = await response.json();
          alert(
            `Failed to delete membership: ${result.error || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the membership.");
      }
    });
  });
}

async function postUsers() {
  const form = document.getElementById("form-container");
  const cancelBtn = document.querySelector(".user-btn");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("firstname").value;
    const lastName = document.getElementById("lastname").value;
    const email = document.getElementById("email").value;
    const membership = document.getElementById("changing").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, surname: lastName, email, membership }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("User added successfully!");
        form.reset();
      } else {
        alert(`Failed to add user: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error.message || error);
      alert("An error occurred while adding the user.");
    }
  });
  cancelBtn.addEventListener("click", () => {
    window.location.href = "./users.html";
  });
}

postUsers();

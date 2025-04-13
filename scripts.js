$(document).ready(function () {
  const API_BASE = "http://localhost:3000";
  let currentUserId = null;

  function showPage(pageId) {
    const pages = ["loginPage", "menuPage", "userInfoPage", "bmiPage", "graphPage", "advicePage"];
    pages.forEach(id => $("#" + id).hide());
    $("#" + pageId).show();
  }

  // Login
  $("#btnLogin").click(function () {
    const userId = $("#uniqueID").val().trim();
    const passcode = $("#passcode").val().trim();
    const msg = $("#loginMessage");

    if (!userId || !passcode) {
      msg.text("Please enter both ID and passcode.").css("color", "red");
      return;
    }

    fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, passcode })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          msg.text("Login successful!").css("color", "green");
          currentUserId = userId;
          showPage("menuPage");
        } else {
          msg.text(data.message || "Login failed.").css("color", "red");
        }
      })
      .catch(() => {
        msg.text("Error logging in.").css("color", "red");
      });
  });

  // Register
  $("#btnCreateID").click(function () {
    const userId = $("#uniqueID").val().trim();
    const passcode = $("#passcode").val().trim();
    const msg = $("#loginMessage");

    if (!userId || !passcode) {
      msg.text("Please enter both ID and passcode.").css("color", "red");
      return;
    }

    fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, passcode })
    })
      .then(res => res.json())
      .then(data => {
        msg.text(data.success ? "New ID created! You can now log in." : data.message || "Registration failed.")
          .css("color", data.success ? "green" : "red");
      })
      .catch(() => {
        msg.text("Error registering.").css("color", "red");
      });
  });

  // Save user info locally
  $("#btnSaveUser").click(function () {
    const userInfo = {
      name: $("#name").val().trim(),
      dob: $("#dob").val(),
      height: $("#height").val().trim()
    };
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    alert("User information saved!");
  });

  // Render entries
  function renderEntries(entries = []) {
    const table = $("#entryTable").empty();
    entries.forEach((entry, index) => {
      const row = `<tr>
        <td>${entry.date}</td>
        <td>${entry.weight} kg</td>
        <td><button class="btnDelete" data-index="${index}">Delete</button></td>
      </tr>`;
      table.append(row);
    });
  }

  // Save BMI entry
  $("#btnSaveEntry").click(function () {
    const date = $("#entryDate").val();
    const weight = parseFloat($("#weight").val());
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (!user || !user.height || isNaN(weight)) {
      alert("Please enter valid user info and weight.");
      return;
    }

    const heightInMeters = parseFloat(user.height) / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const entry = { userId: currentUserId, date, weight, bmi: bmi.toFixed(2) };

    fetch(`${API_BASE}/api/saveBmiEntry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("BMI entry saved.");
          loadEntries();
        } else {
          alert("Failed to save BMI entry.");
        }
      });
  });

  // Load entries
  function loadEntries() {
    fetch(`${API_BASE}/api/getBmiEntries?userId=${currentUserId}`)
      .then(res => res.json())
      .then(data => renderEntries(data.entries || []));
  }

  // Show BMI page
  $("#btnBMI").click(function () {
    showPage("bmiPage");
    loadEntries();
  });

  // Graph
  let bmiChart;
  $("#btnGraph").click(function () {
    fetch(`${API_BASE}/api/getBmiEntries?userId=${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        const entries = data.entries || [];
        const dates = entries.map(e => e.date);
        const bmis = entries.map(e => parseFloat(e.bmi));

        if (bmiChart) bmiChart.destroy();

        const ctx = document.getElementById("bmiChart").getContext("2d");
        bmiChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: dates,
            datasets: [{
              label: "BMI Over Time",
              data: bmis,
              borderColor: "purple",
              borderWidth: 2,
              fill: false
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true }
            }
          }
        });

        showPage("graphPage");
      });
  });

  // Advice
  $("#btnAdvice").click(function () {
    fetch(`${API_BASE}/api/getBmiEntries?userId=${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        const entries = data.entries || [];
        const bmis = entries.map(e => parseFloat(e.bmi));
        let advice = "No entries found.";

        if (bmis.length > 0) {
          const avg = bmis.reduce((a, b) => a + b, 0) / bmis.length;
          if (avg < 18.5) advice = "Underweight: Consider increasing calorie intake.";
          else if (avg < 25) advice = "Normal weight: Keep up the good work!";
          else if (avg < 30) advice = "Overweight: Consider more physical activity.";
          else advice = "Obese: Consult a healthcare provider for support.";
        }

        $("#adviceContent").text(advice);
        showPage("advicePage");
      });
  });

  // Back buttons
  $("#btnBackFromGraph").click(() => showPage("menuPage"));
  $("#btnBackFromAdvice").click(() => showPage("menuPage"));
});
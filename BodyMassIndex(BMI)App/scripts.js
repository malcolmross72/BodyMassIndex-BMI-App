$(document).ready(function () {
    const defaultPassword = "1234";

// Login
$("#btnLogin").click(function () {
    const enteredID = $("#uniqueID").val().trim();
    const enteredPass = $("#passcode").val().trim();
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser.id === enteredID && storedUser.passcode === enteredPass) {
      sessionStorage.setItem("user", JSON.stringify(storedUser));
      $("#loginMessage").text("");
      $("#loginPage").hide();
      $("#menuPage").show();
    } else {
      $("#loginMessage").text("Login failed. Check your credentials.");
    }
  });

  // Create New ID
  $("#btnCreateID").click(function () {
    const newID = $("#uniqueID").val().trim();
    const newPass = $("#passcode").val().trim();

    if (!newID || !newPass) {
      alert("Both ID and passcode are required.");
      return;
    }

    const newUser = { id: newID, passcode: newPass };
    localStorage.setItem("user", JSON.stringify(newUser));
    alert("New ID created. You can now login.");
  }); 
  
  // Save user info
  $("#btnSaveUser").click(function () {
    const userInfo = {
      name: $("#name").val().trim(),
      dob: $("#dob").val(),
      height: $("#height").val().trim()
    };

    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    alert("User information saved!");
  });

  // Auto-load user info
  $("#userInfoPage").on("pageshow", function () {
    const saved = JSON.parse(localStorage.getItem("userInfo"));
    if (saved) {
      $("#name").val(saved.name);
      $("#dob").val(saved.dob);
      $("#height").val(saved.height);
    }
  });

  // Login
  $("#btnLogin").click(function () {
    const enteredID = $("#uniqueID").val().trim();
    const enteredPass = $("#passcode").val().trim();
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser.id === enteredID && storedUser.passcode === enteredPass) {
      sessionStorage.setItem("user", JSON.stringify(storedUser));
      $("#loginMessage").text("");
      $("#loginPage").hide();
      $("#menuPage").show();
    } else {
      $("#loginMessage").text("Login failed. Check your credentials.");
    }
  });

  // Create New ID
  $("#btnCreateID").click(function () {
    const newID = $("#uniqueID").val().trim();
    const newPass = $("#passcode").val().trim();

    if (!newID || !newPass) {
      alert("Both ID and passcode are required.");
      return;
    }

    const newUser = { id: newID, passcode: newPass };
    localStorage.setItem("user", JSON.stringify(newUser));
    alert("New ID created. You can now login.");
  });

 // Save BMI Entry
$("#btnSaveEntry").click(function () {
    const date = $("#entryDate").val();
    const weight = parseFloat($("#weight").val());
    const user = JSON.parse(localStorage.getItem("userInfo"));
  
    if (!user || !user.height) {
      alert("Please enter your user info first.");
      return;
    }
  
    const heightInMeters = parseFloat(user.height) / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
  
    const entry = { date, weight, bmi: bmi.toFixed(2) };
  
    let entries = JSON.parse(localStorage.getItem("bmiEntries")) || [];
    entries.push(entry);
    localStorage.setItem("bmiEntries", JSON.stringify(entries));
    alert("BMI entry saved.");
    renderEntries();
  });
  
  // Render entries in table
  function renderEntries() {
    const entries = JSON.parse(localStorage.getItem("bmiEntries")) || [];
    const table = $("#entryTable");
    table.empty();
  
    entries.forEach((entry, index) => {
      const row = `<tr>
        <td>${entry.date}</td>
        <td>${entry.weight} kg</td>
        <td><button onclick="deleteEntry(${index})">Delete</button></td>
      </tr>`;
      table.append(row);
    });
  }
  
  // Delete entry
  function deleteEntry(index) {
    let entries = JSON.parse(localStorage.getItem("bmiEntries")) || [];
    entries.splice(index, 1);
    localStorage.setItem("bmiEntries", JSON.stringify(entries));
    renderEntries();
  }
  
  // Show entries when BMI page loads
  $("#bmiPage").on("pageshow", renderEntries);

  let bmiChart;

  $("#btnGraph").click(function () {
    $("#menuPage").hide();
    $("#graphPage").show();
  
    const entries = JSON.parse(localStorage.getItem("bmiEntries")) || [];
  
    const dates = entries.map(e => e.date);
    const bmis = entries.map(e => parseFloat(e.bmi));
  
    if (bmiChart) {
      bmiChart.destroy();
    }
  
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
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });
  
  // Go back from graph page
  $("#btnBackFromGraph").click(function () {
    $("#graphPage").hide();
    $("#menuPage").show();
  });

  $("#btnAdvice").click(function () {
    const entries = JSON.parse(localStorage.getItem("bmiEntries")) || [];
    const bmiValues = entries.map(e => parseFloat(e.bmi));
    let advice = "No entries found.";
  
    if (bmiValues.length > 0) {
      const avgBMI = bmiValues.reduce((a, b) => a + b, 0) / bmiValues.length;
  
      if (avgBMI < 18.5) {
        advice = "Underweight: Consider increasing calorie intake.";
      } else if (avgBMI < 25) {
        advice = "Normal weight: Keep up the good work!";
      } else if (avgBMI < 30) {
        advice = "Overweight: Consider more physical activity.";
      } else {
        advice = "Obese: Consult a healthcare provider for support.";
      }
    }
  
    $("#adviceContent").text(advice);
    $("#menuPage").hide();
    $("#advicePage").show();
  });
  
  $("#btnBackFromAdvice").click(function () {
    $("#advicePage").hide();
    $("#menuPage").show();
  }); 
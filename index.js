(function (AddressData, RiskData) {
  let map;
  const addressField = document.getElementById("addressField");
  const addressList = document.getElementById("addressList");

  // debounce function to stop repetive calls
  const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // to get the random values in range
  const getRandomNo = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // add event listner on key up with debounce
  if (addressField) {
    addressField.addEventListener("keyup", debounce(inputChange, 300));
  }

  // add event listner on click of an address from the given list
  if (addressList) {
    addressList.addEventListener("click", addressSelected);
  }

  // input change listner
  function inputChange(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      return false;
    }
    const inputValue = e.target.value.trim();

    // clear existing data
    if (addressList) {
      addressList.innerHTML = "";
    }

    // check for length of input.
    // keeping this minimum length of three.
    if (inputValue.length < 3) {
      return;
    }

    // API call to get the data- autocomplete for address input
    geocodeAddress()
      .then((data) => {
        if (data.length > 0) {
          renderResult(data);
        }
      })
      .catch((error) => {
        console.log("error occured", error);
      });
  }

  // click handler of list of addresses
  function addressSelected(e) {
    const target = e.target;
    // check if it is a list tag
    if (target.classList.contains("addresslist-item")) {
      const latLon = target.getAttribute("data-geo");
      if (latLon) {
        // Api call to get the risk label
        geocodeRisk(latLon)
          .then((data) => {
            if (data) {
              renderRiskLabel(data);
            }
          })
          .catch((error) => {
            console.log("error occured");
          });
      }
      plotMarker(latLon);
      addressField.value = target.innerText;
      addressList.classList.add("hideClass");
    }
  }

  // mock Asyn data  function
  // act like an http call
  async function geocodeAddress(inputStr) {
    const data = await getAddressResponse(inputStr);
    return data;
  }

  // mock Asyn data function
  // act like an http call
  async function geocodeRisk(latLon) {
    const data = await getRiskLabelResponse(latLon);
    return data;
  }

  // get mock random  address data
  function getAddressResponse() {
    const dataLength = AddressData.length;
    if (dataLength > 0) {
      const randomvalue1 = getRandomNo(0, dataLength - 1);
      const randomvalue2 = getRandomNo(0, dataLength - 1);
      // keeping it two , to show the scalability
      return [AddressData[randomvalue1], AddressData[randomvalue2]];
    }
    return [];
  }

  // get mock random risk data
  function getRiskLabelResponse(latLon) {
    const dataLength = RiskData.length;
    if (dataLength > 0) {
      const randomvalue = getRandomNo(0, dataLength - 1);
      return RiskData[randomvalue];
    }
    return null;
  }

  // Render the listor autocomplete
  function renderResult(data) {
    if (addressList) {
      for (address of data) {
        const li = document.createElement("li");
        const currentProp = address.properties;
        // set the latlong in data attribute
        li.setAttribute(
          "data-geo",
          JSON.stringify(address.geometry.coordinates)
        );
        li.className = "addresslist-item";
        li.innerText = `${currentProp.street}, ${currentProp.city}, ${currentProp.state}, ${currentProp.postalCode}`;
        addressList.appendChild(li);
      }
    }

    if (addressList.classList.contains("hideClass")) {
      addressList.classList.remove("hideClass");
    }
  }

  // Render list of risk label
  function renderRiskLabel(data) {
    const riskList = document.getElementById("riskList");
    riskList.innerHTML = "";
    if (riskList) {
      for (key in data) {
        const li = document.createElement("li");
        // Setting key, which may be used in future.
        li.setAttribute("data-key", key);
        li.className = "risklabel-item";
        li.innerText = key + "-" + data[key];
        riskList.appendChild(li);
      }
    }

    // show the list
    riskList.classList.remove("hideClass");
  }

  // Plot the marker at selected position.
  function plotMarker(latLong) {
    if (latLong) {
      if (!map) {
        initalizeMap();
      }
      try {
        const parsedData = JSON.parse(latLong);
        L.marker(parsedData).addTo(map);
        map.setView(parsedData, 16);
      } catch (err) {
        console.log("error occured", err);
      }
    }
  }

  // initialize the map
  function initalizeMap() {
    // dummy lat long to initialize map
    map = L.map("map").setView([0, 0], 1);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }

  initalizeMap();
})(AddressData, RiskData);

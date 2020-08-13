/**
 * we need to have one inout box
 * one Ul li to render list
 * on key up we will ad event listner
 * we will use debounce to improve perf if user type fast
 * after key up we will make a call to get the data
 * render the data in li
 */

(function (AddressData) {
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

  // mock Asyn data  function
  // act like an http call
  async function geocodeAddress(inputStr) {
    const data = await getAddressResponse(inputStr);
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

})(AddressData);

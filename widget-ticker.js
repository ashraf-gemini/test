

const formatSupply = number => {
  const formatter = Intl.NumberFormat("en", { notation: "compact", maximumSignificantDigits: 4 });

  return formatter.format(number);
};

const formatCurrency = (number, minDigits = 2, maxDigits = 7) => {
  if (!number) return null;
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: maxDigits,
    style: "currency",
    currency: "USD",
    minimumFractionDigits: minDigits
  });
  return formatter.format(Number(number));
};

const formatPercentage = number => {
  if (!number) return null;
  return `${number}%`;
};

const getTickerWidget = () => {
  const tickerWidget = document.querySelector(".gemini-ticker-widget");
}


// Utility function to display a loading spinner
const showLoadingSpinner = () => {
  const tickerWidget = getTickerWidget();
  const spinnerHtml = `
    <div id="loading-spinner" style="display: flex; justify-content: center; align-items: center; height: 100px;">
      <div class="loader" style="border: 16px solid #f3f3f3; border-top: 16px solid #3498db; border-radius: 50%; width: 60px; height: 60px; animation: spin 2s linear infinite;">
      </div>
    </div>
  `;
  tickerWidget.innerHTML = spinnerHtml;
};

// Function to generate the HTML content for the ticker widget
const generateTickerWidgetHtml = (coin, baseCurrency, coinData, volumeData, showPercentChange24h) => {
  const volumeHtml = `
    <div style="text-align:center;float:left;flex: 1;font-size:12px;padding:12px 0 16px 0;line-height:1em;">
      VOLUME
      <br><br>
      <span style="font-size: 16px;">${formatSupply(
        Number(volumeData.volume[baseCurrency])
      )} <span style="font-size:12px">${baseCurrency}</span></span>
    </div>
  `;

  const percentChangeHtml = showPercentChange24h
    ? `
    <div style="text-align:center;float:left;flex: 1;font-size:12px;padding:12px 0 16px 0;line-height:1em;">
      % CHANGE (24H)
      <br><br>
      <span style="font-size: 16px;color:${coinData.percentChange24h >= 0 ? "green" : "red"};">${formatPercentage(
        coinData.percentChange24h
      )}</span>
    </div>
  `
    : "";

  return `
    <div style="font-family: '__Inter_a64ecd','__Inter_Fallback_a64ecd';">
      <div style="display:flex;padding:12px 0px; justify-content: center; align-items: center; gap: 1rem;">
        <div style="width:max-content;display: flex;justify-content: center;align-items: center;">
          <!-- TODO: Replace the coin logo with your own logo -->
          <img style="width:46px;height:46px;" src="https://i.imgur.com/EZ1h5S1.png">
        </div>
        <div style="border: none;text-align:left;line-height:1.4">
          <span style="font-size: 18px;"><a href=${`https://www.gemini.com/prices/${coin}`} target="_blank" style="text-decoration: none; color: rgb(16, 112, 224);">${coin} (${baseCurrency})</a></span>
          <br>
          <span style="font-size: 16px;">
            <span style="font-size: 20px; font-weight: 500;">${formatCurrency(coinData.price)}</span>
            <span style="font-size: 14px; font-weight: 500;">${baseCurrency}</span>                    
          </span>
        </div>
      </div>
      <div style="border-top: 1px solid #e1e5ea;display: flex; align-items:center; justify-content: space-around;">             
        ${volumeHtml}
        ${percentChangeHtml}
      </div>
      <div style="border-top: 1px solid #e1e5ea;text-align:center;clear:both;font-size:12px;font-style:italic;padding:8px 0;">
        <a href="https://www.gemini.com/india" target="_blank" style="text-decoration: none; color: rgb(16, 112, 224);">Powered by Gemini 🪐</a>
      </div>
    </div>
  `;
};

function fetchDataFromApi(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

// Main function to fetch and update data
const updateTickerData = (coin, baseCurrency, showPercentChange24h) => {
  const tickerWidget = getTickerWidget();
  const priceFeedApiUrl = "https://api.gemini.com/v1/pricefeed";
  const volumeApiUrl = `https://api.gemini.com/v1/pubticker/${coin.toLowerCase()}${baseCurrency.toLowerCase()}`;

  // Show loading spinner while fetching initial data
  showLoadingSpinner();

  // Fetch price feed data and volume data in parallel
  Promise.all([fetchDataFromApi(priceFeedApiUrl), fetchDataFromApi(volumeApiUrl)])
    .then(([priceFeedData, volumeData]) => {
      // Find the data for the specified coin and base currency
      const coinData = priceFeedData.find(entry => entry.pair === `${coin}${baseCurrency}`);
      if (!coinData) {
        const errorMessage = `Data for ${coin}${baseCurrency} not found.`;
        console.error(errorMessage);
        return;
      }

      // Hide the spinner once data is fetched
      const loadingSpinner = document.getElementById("loading-spinner");
      if (loadingSpinner) {
        loadingSpinner.style.display = "none";
      }

      // Generate HTML content and update the widget
      const widgetContentHtml = generateTickerWidgetHtml(
        coin,
        baseCurrency,
        coinData,
        volumeData,
        showPercentChange24h
      );
      tickerWidget.innerHTML = widgetContentHtml;
    })
    .catch(error => {
      console.error("Error updating ticker data:", error);
    });
};

// Function to apply the theme based on the 'theme' attribute
const applyTheme = theme => {
  const tickerWidget = getTickerWidget();
  tickerWidget.style.border = "2px solid #e1e5ea";
  tickerWidget.style.borderRadius = "10px";
  tickerWidget.style.overflow = "hidden";
  tickerWidget.style.display = "block";
  tickerWidget.style.width = "100%";
  if (theme === "dark") {
    // Apply dark theme styles
    tickerWidget.style.backgroundColor = "#333";
    tickerWidget.style.color = "#fff";
  } else {
    // Default to light theme styles
    tickerWidget.style.backgroundColor = "#f9f9f9";
    tickerWidget.style.color = "#333";
  }
};

// Entry point to start the ticker
const startTicker = () => {
  console.log('ticker started');
  const tickerWidget = getTickerWidget();
  if (!tickerWidget) {
    console.log("Ticker widget element not found.");
  }
  
  const showTicker = tickerWidget.getAttribute("data-ticker") === "true";

  if (!tickerWidget) {
    console.error("Ticker widget element not found.");
    return;
  }

  // Extract values from data attributes with default fallbacks
  const coin = tickerWidget.getAttribute("data-coin");
  const baseCurrency = tickerWidget.getAttribute("data-base");
  const showPercentChange24h = tickerWidget.getAttribute("data-percentChange24h") === "true";
  const theme = tickerWidget.getAttribute("data-theme") || "light"; // Default to light theme

  // Apply the selected theme
  applyTheme(theme);

  // Initial data fetch
  updateTickerData(coin, baseCurrency, showPercentChange24h);

  // Start periodic updates if needed
  if (showTicker) {
    setInterval(() => {
      updateTickerData(coin, baseCurrency, showPercentChange24h);
    }, 5000); // Update every 5 seconds (adjust as needed)
  }
};

document.addEventListener("DOMContentLoaded", function() {
  // Your JavaScript code here
  console.log('dom content loaded');
  startTicker();
});

import puppeteer from "puppeteer";

const demoAutomation = async (page) => {
  // Type into search box
  await page.type(".devsite-search-field", "automate beyond recorder");

  // Wait and click on first result
  const searchResultSelector = ".devsite-result-item-link";
  await page.waitForSelector(searchResultSelector);
  await page.click(searchResultSelector);

  // Locate the full title with a unique string
  const textSelector = await page.waitForSelector(
    "text/Customize and automate"
  );
  const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  //   Print the full title
  console.log('The title of this blog post is "%s".', fullTitle);
};

const loginInfo = async (page, username, password) => {
  await page.type('input[id="usernameField"]', username);
  // Type in the password
  await page.type('input[id="passwordField"]', password);
  // Click the login button
  await page.click('button[type="submit"]');
};

const searchForJobs = async (
  page,
  designation = "react.js",
  exp = "3 years",
  location = "india"
) => {
  await page.waitForSelector(
    "body > div.nI-gNb-header > div.nI-gNb-header__wrapper > div.nI-gNb-search-bar > div"
  );
  const buttonClick = await page.$(
    "body > div.nI-gNb-header > div.nI-gNb-header__wrapper > div.nI-gNb-search-bar > div"
  );

  await buttonClick.click();

  // designation
  await page.type(
    "body > div.nI-gNb-header > div.nI-gNb-header__wrapper > div.nI-gNb-search-bar > div > div > div.nI-gNb-sb__keywords > div > div > div > input",
    designation
  );

  // exp
  await page.type('input[id="experienceDD"]', exp);

  // location
  await page.type(
    "body > div.nI-gNb-header > div.nI-gNb-header__wrapper > div.nI-gNb-search-bar > div > div > div.nI-gNb-sb__locations > div > div > div > input",
    location
  );

  // click on search
  await page.waitForSelector(
    "body > div.nI-gNb-header > div.nI-gNb-header__wrapper > div.nI-gNb-search-bar > div > button"
  );

  await page.click(
    "body > div.nI-gNb-header > div.nI-gNb-header__wrapper > div.nI-gNb-search-bar > div > button"
  );
};

const getJobsList = async (page) => {
  await page.waitForSelector(
    "#listContainer > div.styles_job-listing-container__OCfZC > div > div"
  );
  const elements = await page.$$(".srp-jobtuple-wrapper");

  const jobListings = await Promise.all(
    elements.map(async (element) => {
      const jobData = await element.evaluate((el) => ({
        jobTitle:
          el.querySelector("div.row1 h2 a.title")?.innerText.trim() || "",
        jobLink: el.querySelector("div.row1 h2 a.title")?.href || "",
        companyLogo: el.querySelector("div.row1 span.imagewrap img")?.src || "",
        companyName:
          el.querySelector("div.row2 a.comp-name")?.innerText.trim() || "",
        postedBy:
          el
            .querySelector("div.row2 .client-company-name a")
            ?.innerText.trim() || "",
        experience:
          el
            .querySelector("div.row3 span.exp-wrap span.expwdth")
            ?.innerText.trim() || "",
        salary:
          el
            .querySelector("div.row3 span.sal-wrap span.sal")
            ?.innerText.trim() || "",
        location:
          el
            .querySelector("div.row3 span.loc-wrap span.locWdth")
            ?.innerText.trim() || "",
        jobDescription:
          el.querySelector("div.row4 .job-desc")?.innerText.trim() || "",
        tags: Array.from(el.querySelectorAll("div.row5 li")).map((li) =>
          li.innerText.trim()
        ),
        postDate:
          el.querySelector("div.row6 span.job-post-day")?.innerText.trim() ||
          "",
      }));

      return {
        ...jobData,
        openInNewTab: async () => {
          if (jobData.jobLink) {
            const newPage = await page.browser().newPage();
            await newPage.goto(jobData.jobLink, { waitUntil: "networkidle2" });
          } else {
            console.warn("No job link available to open.");
          }
        },
      };
    })
  );

  console.log(jobListings);

  return jobListings;
};

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://www.naukri.com/nlogin/login");

  // Set screen size
  await page.setViewport({ width: 1920, height: 1080 });

  await loginInfo(page, "gauravchauhan5263@gmail.com", "Gaurav@123");

  await searchForJobs(page, "react.js,redux,javascript");

  await getJobsList(page);
  //   await browser.close();
})();

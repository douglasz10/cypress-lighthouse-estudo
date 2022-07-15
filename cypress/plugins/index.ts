/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */

 const { lighthouse, pa11y, prepareAudit } = require("cypress-audit");
 const fs = require("fs");

export default (on, config) => {
  on("before:browser:launch", (browser = {}, launchOptions) => {
    prepareAudit(launchOptions);
  });

  on("task", {
    lighthouse: lighthouse((lighthouseReport) => {
      const categories = lighthouseReport.lhr.categories;
      const audits = lighthouseReport.lhr.audits;
      const newPath = './cypress/fixtures'
      const formattedAudit = Object.keys(audits).reduce(
        (metrics, curr) => ({
          ...metrics,
          [curr]: audits[curr].numericValue,
        }),
        {}
      );
      const formattedAuditsResults = {
        url: lighthouseReport.lhr.requestedUrl,
        ...formattedAudit,
      };
      const auditReportName =
        "./audit-" +
        lighthouseReport.lhr.requestedUrl.replace(
          /[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g,
          function (x) {
            return "";
          }
        ) +
        " - " +
        lighthouseReport.lhr.fetchTime.split("T")[0] +
        ".json";

      fs.writeFileSync(
        auditReportName,
        JSON.stringify(formattedAuditsResults, null, 2)
      );
      const formattedCategories = Object.keys(categories).reduce(
        (metrics, curr) => ({
          ...metrics,
          [curr]: categories[curr].score * 100,
        }),
        {}
      );

      const formattedCategoriesResults = {
        url: lighthouseReport.lhr.requestedUrl,
        ...formattedCategories,
      };
      console.log(formattedCategoriesResults)
      const categoriesReportName =
        "./categories-" +
        lighthouseReport.lhr.requestedUrl.replace(
          /[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g,
          function (x) {
            return "";
          }
        ) +
        " - " +
        lighthouseReport.lhr.fetchTime.split("T")[0] +
        ".json";

      fs.writeFileSync(
        categoriesReportName,
        JSON.stringify(formattedCategoriesResults, null, 2)
        
      );
      // Salva o JSON completo que pode ser visualizado em https://googlechrome.github.io/lighthouse/viewer/
      fs.writeFileSync(`${newPath}/report.json`, JSON.stringify(lighthouseReport, null, 2))
    }),
    
  });
  
}


// import "./views/importModalView.ts";
// import "./views/categoriesModalView.ts";
// import "./views/filterSelectView.ts";
// import "./views/entriesTableView.ts";
// import "./views/sessionLoaderView.ts";

import SessionLoaderView from "./views/SessionButtons.ts";
import ImportModal from "./views/ImportModal.ts";
import CategoriesButton from "./views/CategoriesButton.ts";
import ImportButton from "./views/ImportButton.ts";
import CategoriesModal from "./views/CategoriesModal.ts";
import FilterSelectors from "./views/FilterSelectors.ts";
import EntriesTable from "./views/EntriesTable.ts";
import CategoriesStats from "./views/CategoriesStats.ts";
import SessionSelect from "./views/SessionSelect.ts";

// Modals need to be rendered first...
ImportModal("#import-modal");
CategoriesModal("#categories-modal");

SessionSelect("#session-select");
SessionLoaderView("#session-buttons");
CategoriesButton("#categories-button");
ImportButton("#import-button");
FilterSelectors("#filter-selectors");
EntriesTable("#entries-table");
CategoriesStats("#categories-stats");

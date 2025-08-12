import SessionLoaderView from "./views/SessionButtons.ts";
import ImportModal from "./views/ImportModal.ts";
import CategoriesButton from "./views/CategoriesButton.ts";
import ImportButton from "./views/ImportButton.ts";
import CategoriesModal from "./views/CategoriesModal.ts";
import FilterSelectors from "./views/FilterSelectors.ts";
import EntriesTable from "./views/EntriesTable.ts";
import CategoriesStats from "./views/CategoriesStats.ts";
import SessionSelect from "./views/SessionSelect.ts";
import Layout from "./views/Layout.ts";

// The layout needs to be rendered first
Layout("#layout");

// Then the modals...
ImportModal("#import-modal");
CategoriesModal("#categories-modal");

SessionSelect("#session-select");
SessionLoaderView("#session-buttons");
CategoriesButton("#categories-button");
ImportButton("#import-button");
FilterSelectors("#filter-selectors");
EntriesTable("#entries-table");
CategoriesStats("#categories-stats");
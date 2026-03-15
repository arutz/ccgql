import { gql } from "apollo-angular";

import { CITY_SUMMARY_FRAGMENT } from "./city-operations";
import { PERSON_SUMMARY_FRAGMENT } from "./person-operations";

export const LIST_HOME_SUMMARIES_QUERY = gql`
  query ListHomeSummaries {
    listPersons {
      ...PersonSummary
    }
    listCities {
      ...CitySummary
    }
  }

  ${PERSON_SUMMARY_FRAGMENT}
  ${CITY_SUMMARY_FRAGMENT}
`;


import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import * as fragments from '../../components/collective-page/graphql/fragments';

export const transactionFields = `
  id
  uuid
  description
  createdAt
  type
  amount
  currency
  hostCurrency
  hostCurrencyFxRate
  netAmountInCollectiveCurrency
  hostFeeInHostCurrency
  platformFeeInHostCurrency
  taxAmount
  paymentProcessorFeeInHostCurrency
  paymentMethod {
    service
    type
    name
    data
  }
  collective {
    id
    slug
    name
    type
    imageUrl
    isIncognito
  }
  fromCollective {
    id
    name
    slug
    path
    type
    imageUrl
    isIncognito
  }
  usingVirtualCardFromCollective {
    id
    slug
    name
    type
  }
  host {
    id
    slug
    name
    currency
    hostFeePercent
    type
  }
  ... on Expense {
    expense {
      id
      category
      attachment
    }
  }
  ... on Order {
    createdAt
    subscription {
      interval
    }
  }
`;

/* eslint-disable graphql/template-strings, graphql/no-deprecated-fields, graphql/capitalized-type-name, graphql/named-operations */
export const getTransactionsQuery = gql`
query Transactions($CollectiveId: Int!, $type: String, $limit: Int, $offset: Int, $dateFrom: String, $dateTo: String) {
  allTransactions(CollectiveId: $CollectiveId, type: $type, limit: $limit, offset: $offset, dateFrom: $dateFrom, dateTo: $dateTo) {
    ${transactionFields}
    refundTransaction {
      ${transactionFields}
    }
  }
}
`;
/* eslint-enable graphql/template-strings, graphql/no-deprecated-fields, graphql/capitalized-type-name, graphql/named-operations */

export const getLoggedInUserQuery = gql`
  query LoggedInUser {
    LoggedInUser {
      id
      username
      firstName
      lastName
      email
      paypalEmail
      image
      CollectiveId
      collective {
        id
        name
        type
        slug
        imageUrl
        settings
        currency
        isDeletable
        location {
          country
        }
        paymentMethods(limit: 10, hasBalanceAboveZero: true) {
          id
          uuid
          currency
          name
          service
          type
          data
          balance
          expiryDate
        }
        connectedAccounts {
          service
        }
      }
      memberOf {
        id
        role
        collective {
          id
          slug
          type
          isIncognito
          name
          currency
          isHost
          imageUrl
          stats {
            id
            balance
          }
          paymentMethods(limit: 10, hasBalanceAboveZero: true) {
            id
            uuid
            currency
            name
            service
            type
            data
            balance
            expiryDate
          }
          settings
        }
      }
    }
  }
`;

export const getCollectiveToEditQueryFields = `
  id
  type
  slug
  createdByUser {
    id
  }
  host {
    id
    createdAt
    slug
    name
    currency
    settings
    description
    website
    twitterHandle
    imageUrl
    backgroundImage
    hostCollective {
      id
      slug
      name
      currency
    }
    location {
      country
    }
    stats {
      id
      collectives {
        hosted
      }
    }
  }
  name
  company
  image # We still query 'image' because it's required for the edition
  imageUrl
  backgroundImage
  description
  longDescription
  location {
    name
    address
    country
    lat
    long
  }
  tags
  twitterHandle
  githubHandle
  website
  currency
  settings
  createdAt
  isActive
  isArchived
  isApproved
  isDeletable
  isHost
  hostFeePercent
  expensePolicy
  stats {
    id
    yearlyBudget
    balance
    backers {
      all
    }
    totalAmountSpent
  }
  tiers {
    id
    slug
    type
    name
    description
    longDescription
    amount
    presets
    amountType
    minimumAmount
    goal
    interval
    currency
    maxQuantity
    button
  }
  memberOf {
    id
    createdAt
    role
    stats {
      totalDonations
    }
    tier {
      id
      name
    }
    collective {
      id
      type
      slug
      name
      currency
      description
      settings
      imageUrl
      stats {
        id
        backers {
          all
        }
        yearlyBudget
      }
    }
  }
  members(roles: ["ADMIN", "MEMBER", "HOST"]) {
    id
    createdAt
    since
    role
    description
    stats {
      totalDonations
    }
    tier {
      id
      name
    }
    member {
      id
      name
      imageUrl
      slug
      twitterHandle
      description
      ... on User {
        email
      }
    }
  }
  paymentMethods(types: ["creditcard", "virtualcard", "prepaid"], hasBalanceAboveZero: true) {
    id
    uuid
    name
    data
    monthlyLimitPerMember
    service
    type
    balance
    currency
    expiryDate
    orders(hasActiveSubscription: true) {
      id
    }
  }
  connectedAccounts {
    id
    service
    username
    createdAt
    settings
    updatedAt
  }
`;

/* eslint-disable graphql/template-strings, graphql/no-deprecated-fields, graphql/capitalized-type-name, graphql/named-operations */
const getCollectiveToEditQuery = gql`
  query Collective($slug: String) {
    Collective(slug: $slug) {
      ${getCollectiveToEditQueryFields}
    }
  }
`;
/* eslint-enable graphql/template-strings, graphql/no-deprecated-fields, graphql/capitalized-type-name, graphql/named-operations */

export const getCollectiveQuery = gql`
  query Collective($slug: String) {
    Collective(slug: $slug) {
      id
      isActive
      isPledged
      type
      slug
      path
      createdByUser {
        id
      }
      name
      company
      imageUrl
      backgroundImage
      description
      longDescription
      location {
        name
        address
        country
        lat
        long
      }
      twitterHandle
      githubHandle
      website
      currency
      settings
      createdAt
      stats {
        id
        balance
        yearlyBudget
        backers {
          all
          users
          organizations
          collectives
        }
        collectives {
          hosted
          memberOf
        }
        transactions {
          id
          all
        }
        expenses {
          id
          all
        }
        updates
        events
        totalAmountSpent
        totalAmountRaised
        totalAmountReceived
      }
      tiers {
        id
        slug
        type
        name
        description
        hasLongDescription
        button
        amount
        amountType
        minimumAmount
        presets
        interval
        currency
        maxQuantity
        stats {
          id
          totalOrders
          totalActiveDistinctOrders
          availableQuantity
        }
        orders(limit: 30, isActive: true) {
          fromCollective {
            id
            slug
            type
            name
            imageUrl
            website
            isIncognito
          }
        }
      }
      isHost
      hostFeePercent
      canApply
      isArchived
      isApproved
      isDeletable
      host {
        id
        slug
        name
        imageUrl
      }
      members {
        id
        role
        createdAt
        since
        description
        member {
          id
          description
          name
          slug
          type
          imageUrl
          backgroundImage
          isIncognito
          company
        }
      }
      ... on User {
        isIncognito
        memberOf(limit: 60) {
          id
          role
          createdAt
          stats {
            totalDonations
            totalRaised
          }
          collective {
            id
            name
            currency
            slug
            path
            type
            imageUrl
            backgroundImage
            description
            longDescription
            parentCollective {
              slug
            }
          }
        }
      }
      ... on Organization {
        memberOf(limit: 60) {
          id
          role
          createdAt
          stats {
            totalDonations
            totalRaised
          }
          collective {
            id
            name
            currency
            slug
            path
            type
            imageUrl
            backgroundImage
            description
            longDescription
            parentCollective {
              slug
            }
          }
        }
      }
    }
  }
`;

const getEventCollectiveQuery = gql`
  query Collective($eventSlug: String) {
    Collective(slug: $eventSlug) {
      id
      type
      slug
      path
      createdByUser {
        id
      }
      name
      imageUrl
      backgroundImage
      description
      longDescription
      startsAt
      endsAt
      timezone
      currency
      settings
      location {
        name
        address
        country
        lat
        long
      }
      tiers {
        id
        slug
        type
        name
        description
        amount
        amountType
        minimumAmount
        presets
        currency
        maxQuantity
        stats {
          id
          availableQuantity
        }
      }
      parentCollective {
        id
        slug
        name
        mission
        currency
        imageUrl
        backgroundImage
        settings
      }
      stats {
        id
        balance
        expenses {
          id
          all
        }
        transactions {
          id
          all
        }
      }
      members {
        id
        createdAt
        role
        member {
          id
          name
          imageUrl
          slug
          twitterHandle
          description
        }
      }
      orders {
        id
        createdAt
        quantity
        publicMessage
        fromCollective {
          id
          name
          company
          image # For Event Sponsors
          imageUrl
          slug
          twitterHandle
          description
          ... on User {
            email
          }
        }
        tier {
          id
          name
        }
      }
    }
  }
`;

const getCollectiveCoverQuery = gql`
  query CollectiveCover($slug: String, $throwIfMissing: Boolean) {
    Collective(slug: $slug, throwIfMissing: $throwIfMissing) {
      id
      type
      slug
      path
      name
      currency
      settings
      imageUrl
      backgroundImage
      isHost
      isActive
      tags
      stats {
        id
        balance
        updates
        events
        yearlyBudget
        totalAmountReceived
        backers {
          all
        }
      }
      createdByUser {
        id
      }
      host {
        id
        slug
        name
        imageUrl
      }
      parentCollective {
        id
        slug
        name
      }
      location {
        name
      }
      members {
        id
        role
        createdAt
        description
        member {
          id
          description
          name
          slug
          type
          isIncognito
          imageUrl
        }
      }
    }
  }
`;

export const getSubscriptionsQuery = gql`
  query Collective($slug: String) {
    Collective(slug: $slug) {
      id
      type
      slug
      createdByUser {
        id
      }
      name
      company
      imageUrl
      backgroundImage
      description
      twitterHandle
      website
      currency
      settings
      createdAt
      stats {
        id
        totalAmountSpent
        totalAmountRaised
      }
      ordersFromCollective(subscriptionsOnly: true) {
        id
        currency
        totalAmount
        interval
        createdAt
        isSubscriptionActive
        isPastDue
        status
        collective {
          id
          name
          currency
          slug
          type
          imageUrl
          backgroundImage
          description
          longDescription
        }
        fromCollective {
          id
          slug
          createdByUser {
            id
          }
        }
        paymentMethod {
          id
          uuid
          currency
          name
          service
          type
          data
          balance
          expiryDate
        }
      }
      paymentMethods {
        id
        uuid
        currency
        name
        service
        type
        data
        balance
        expiryDate
      }
      ... on User {
        memberOf(limit: 60) {
          id
          role
          createdAt
          stats {
            totalDonations
            totalRaised
          }
          collective {
            id
          }
        }
      }

      ... on Organization {
        memberOf(limit: 60) {
          id
          role
          createdAt
          stats {
            totalDonations
            totalRaised
          }
          collective {
            id
          }
        }
      }
    }
  }
`;

/** A query to get the virtual cards created by a collective. Must be authenticated. */
export const getCollectiveVirtualCards = gql`
  query CollectiveVirtualCards($CollectiveId: Int, $isConfirmed: Boolean, $limit: Int, $offset: Int) {
    Collective(id: $CollectiveId) {
      createdVirtualCards(isConfirmed: $isConfirmed, limit: $limit, offset: $offset) {
        offset
        limit
        total
        paymentMethods {
          id
          uuid
          currency
          name
          service
          type
          data
          initialBalance
          monthlyLimitPerMember
          balance
          expiryDate
          isConfirmed
          data
          createdAt
          expiryDate
          description
          collective {
            id
            slug
            imageUrl
            type
            name
          }
        }
      }
    }
  }
`;

export const searchCollectivesQuery = gql`
  query search($term: String!, $limit: Int, $offset: Int) {
    search(term: $term, limit: $limit, offset: $offset) {
      collectives {
        id
        isActive
        type
        slug
        path
        name
        company
        imageUrl
        backgroundImage
        description
        longDescription
        website
        currency
        stats {
          id
          balance
          totalAmountSpent
          yearlyBudget
          backers {
            all
          }
        }
        memberOf(role: "BACKER") {
          id
        }
      }
      limit
      offset
      total
    }
  }
`;

export const getLoggedInUserApplicationsQuery = gql`
  query LoggedInUserApplications {
    LoggedInUser {
      id
      collective {
        id
        ... on User {
          id
          applications {
            id
            type
            apiKey
          }
        }
      }
    }
  }
`;

/**
 * A query to get a collective source payment methods. This will not return
 * virtual cards, as a virtual card cannot be used as a source payment method
 * for another payment method.
 */
export const getCollectiveSourcePaymentMethodsQuery = gql`
  query Collective($id: Int) {
    Collective(id: $id) {
      id
      paymentMethods(types: ["creditcard", "prepaid"], hasBalanceAboveZero: true) {
        id
        uuid
        name
        data
        monthlyLimitPerMember
        service
        type
        balance
        currency
        expiryDate
      }
    }
  }
`;

export const getNewCollectivePageQuery = gql`
  query NewCollectivePage($slug: String!, $nbContributorsPerContributeCard: Int) {
    Collective(slug: $slug) {
      id
      slug
      path
      name
      description
      longDescription
      backgroundImage
      twitterHandle
      githubHandle
      website
      tags
      company
      type
      currency
      settings
      isApproved
      isArchived
      isHost
      hostFeePercent
      image
      imageUrl
      stats {
        id
        balance
        yearlyBudget
        updates
        backers {
          id
          all
          users
          organizations
        }
      }
      parentCollective {
        id
        image
        twitterHandle
        type
      }
      host {
        id
        name
        slug
        type
      }
      coreContributors: contributors(roles: [ADMIN, MEMBER]) {
        ...ContributorsFieldsFragment
      }
      financialContributors: contributors(roles: [BACKER], limit: 150) {
        ...ContributorsFieldsFragment
      }
      tiers {
        id
        name
        slug
        description
        hasLongDescription
        goal
        interval
        currency
        amount
        minimumAmount
        button
        amountType
        type
        stats {
          id
          totalDonated
          totalRecurringDonations
          contributors {
            id
            all
            users
            organizations
          }
        }
        contributors(limit: $nbContributorsPerContributeCard) {
          id
          image
          collectiveSlug
          name
          type
        }
      }
      events(includePastEvents: true) {
        id
        slug
        name
        description
        image
        startsAt
        endsAt
        backgroundImageUrl(height: 208)
        contributors(limit: $nbContributorsPerContributeCard, roles: [BACKER, ATTENDEE]) {
          id
          image
          collectiveSlug
          name
          type
        }
        stats {
          id
          backers {
            id
            all
            users
            organizations
          }
        }
      }
      childCollectives {
        id
        slug
        name
        type
        description
        backgroundImageUrl(height: 208)
        stats {
          id
          backers {
            id
            all
            users
            organizations
          }
        }
        contributors(limit: $nbContributorsPerContributeCard) {
          id
          image
          collectiveSlug
          name
          type
        }
      }
      ...TransactionsAndExpensesFragment
      updates(limit: 3, onlyPublishedUpdates: true) {
        ...UpdatesFieldsFragment
      }
    }
  }

  ${fragments.TransactionsAndExpensesFragment}
  ${fragments.UpdatesFieldsFragment}
  ${fragments.ContributorsFieldsFragment}
`;

export const getTierPageQuery = gql`
  query TierPage($tierId: Int!) {
    Tier(id: $tierId) {
      id
      name
      slug
      description
      longDescription
      videoUrl
      goal
      currency
      interval

      stats {
        id
        totalDonated
        totalRecurringDonations
        contributors {
          id
          all
          collectives
          organizations
          users
        }
      }

      collective {
        id
        slug
        type
        name
        backgroundImage
        settings
        currency
        isArchived
        path
        host {
          id
        }
        stats {
          id
          updates
          balance
          transactions {
            id
            all
          }
        }
        admins: members(role: "ADMIN") {
          id
          role
          collective: member {
            id
            type
            slug
            name
            image
          }
        }
        parentCollective {
          id
          twitterHandle
          image
        }
      }

      contributors {
        id
        name
        roles
        isAdmin
        isCore
        isBacker
        isFundraiser
        since
        description
        publicMessage
        collectiveSlug
        totalAmountDonated
        type
        isIncognito
      }
    }
  }
`;

export const addCollectiveData = graphql(getCollectiveQuery);
export const addCollectiveCoverData = (component, options) => {
  return graphql(getCollectiveCoverQuery, options)(component);
};
export const addCollectiveToEditData = (component, options) => {
  return graphql(getCollectiveToEditQuery, options)(component);
};
export const addEventCollectiveData = graphql(getEventCollectiveQuery);
export const addSubscriptionsData = graphql(getSubscriptionsQuery);
export const addSearchQueryData = graphql(searchCollectivesQuery);

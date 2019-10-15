import React, { useRef, useState, useLayoutEffect } from 'react';
import styled, { css } from 'styled-components';
import { createPortal } from 'react-dom';
import { Mutation } from 'react-apollo';
import { Times } from 'styled-icons/fa-solid/Times';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import gql from 'graphql-tag';
import { Box, Flex } from '@rebass/grid';
import cloneDeep from 'lodash/cloneDeep';

import { Span } from './Text';
import StyledButton from './StyledButton';
import StyledInput from './StyledInput';
import { MAX_CONTRIBUTORS_PER_CONTRIBUTE_CARD } from './contribute-cards/Contribute';
import { getNewCollectivePageQuery, getTierPageQuery } from '../lib/graphql/queries';
import { fadeIn } from './StyledKeyframes';

const POPUP_ARROW_WIDTH = 20;

/** Pop-up for editing the public message */
const EditPublicMessagePopupContainer = styled.div`
  position: absolute;
  top: ${({ position }) => position.y}px;
  left: ${({ position }) => position.x}px;
  padding: 8px;
  border: 1px solid #f3f3f3;
  border-radius: 8px;
  background: white;
  box-shadow: 0px 4px 8px rgba(20, 20, 20, 0.16);
  animation: ${fadeIn} 0.3s ease-in-out;
  z-index: 1;
  ${({ position }) =>
    position.left &&
    css`
      &:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 100%;
        border-top: ${POPUP_ARROW_WIDTH}px solid transparent;
        border-bottom: ${POPUP_ARROW_WIDTH}px solid transparent;
        border-left: ${POPUP_ARROW_WIDTH}px solid white;
        filter: drop-shadow(4px 0px 4px rgba(20, 20, 20, 0.09));
        transform: translateY(-50%);
      }
    `}
  ${({ position }) =>
    position.right &&
    css`
      &:before {
        content: '';
        position: absolute;
        top: 50%;
        left: -${POPUP_ARROW_WIDTH}px;
        border-top: ${POPUP_ARROW_WIDTH}px solid transparent;
        border-bottom: ${POPUP_ARROW_WIDTH}px solid transparent;
        border-right: ${POPUP_ARROW_WIDTH}px solid white;
        filter: drop-shadow(-4px 0px 4px rgba(20, 20, 20, 0.09));
        transform: translateY(-50%);
      }
    `}
`;

const EditPublicMessageMutation = gql`
  mutation EditPublicMessageMutation($FromCollectiveId: Int!, $CollectiveId: Int!, $message: String) {
    editPublicMessage(FromCollectiveId: $FromCollectiveId, CollectiveId: $CollectiveId, message: $message) {
      id
      publicMessage
      tier {
        id
      }
      collective {
        slug
      }
    }
  }
`;

const messages = defineMessages({
  publicMessagePlaceholder: {
    id: 'contribute.publicMessage.placeholder',
    defaultMessage: 'Motivate others to contribute in 140 characters :) ...',
  },
});

const PUBLIC_MESSAGE_MAX_LENGTH = 140;

function EditPublicMessagePopup({ fromCollectiveId, collectiveId, cardRef, onClose, message, intl }) {
  // Root element outside of React where the popup will be rendered.
  const rootElementRef = useRef();
  // Popup root element reference
  const popupRef = useRef();
  const [editMessagePopupPosition, setEditMessagePopupPosition] = useState({
    x: 0,
    y: 0,
    left: false,
    right: false,
  });
  const [messageDraft, setMessageDraft] = useState(message || '');

  /** Add the root element to the document */
  useLayoutEffect(() => {
    document.body.appendChild(rootElementRef.current);
    return () => rootElementRef.current.remove();
  }, []);

  /** Determine the position to render the popup relative to the contributor card */
  useLayoutEffect(() => {
    const cardRect = cardRef.current.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    /** Check if popup fits to the right */
    const viewportWithWithoutScrollbar = document.body.clientWidth;
    const cardX = window.scrollX + cardRect.x;
    const cardY = window.scrollY + cardRect.y;
    if (cardRect.x + cardRect.width + popupRect.width + POPUP_ARROW_WIDTH <= viewportWithWithoutScrollbar) {
      const x = cardX + cardRect.width + POPUP_ARROW_WIDTH;
      setEditMessagePopupPosition({ x, y: cardY, right: true });
      // /** Check if popup fits to the left */
    } else if (cardRect.x - popupRect.width - POPUP_ARROW_WIDTH >= 0) {
      const x = cardX - popupRect.width - POPUP_ARROW_WIDTH;
      setEditMessagePopupPosition({ x, y: cardY, left: true });
      // /** Position popup at the bottom */
    } else {
      const popupHalfWidth = popupRect.width / 2;
      const cardHalfWidth = cardRect.width / 2;
      let x = cardX - popupHalfWidth + cardHalfWidth;
      /** Add vertical offset */
      const y = cardY + cardRect.height + 10;
      /** Check if popup will fit horizontally. Adjust if it doesn't */
      if (x < 0) {
        x = 0;
      } else if (x + popupRect.width > viewportWithWithoutScrollbar) {
        x -= x + popupRect.width - viewportWithWithoutScrollbar;
      }
      setEditMessagePopupPosition({ x, y });
    }
  }, []);

  /** Lazily setup the root element */
  function getRootElem() {
    if (!rootElementRef.current) {
      rootElementRef.current = document.createElement('div');
    }
    return rootElementRef.current;
  }

  return createPortal(
    <Mutation mutation={EditPublicMessageMutation}>
      {(submitMessage, { loading, error }) => (
        <EditPublicMessagePopupContainer
          data-cy="EditPublicMessagePopup"
          position={editMessagePopupPosition}
          ref={popupRef}
        >
          <Flex justifyContent="flex-end">
            <Times size="1em" color="#a2a2a2" cursor="pointer" onClick={onClose} />
          </Flex>
          <Flex flexDirection="column" p={2}>
            <Span fontSize="Paragraph" color="black.600" mb={2}>
              <FormattedMessage id="contribute.publicMessage" defaultMessage="Leave a public message (Optional)" />
            </Span>

            <StyledInput
              name="publicMessage"
              as="textarea"
              px={10}
              py={10}
              width={240}
              height={112}
              fontSize="Paragraph"
              style={{ resize: 'none' }}
              placeholder={intl.formatMessage(messages.publicMessagePlaceholder)}
              value={messageDraft}
              maxLength={PUBLIC_MESSAGE_MAX_LENGTH}
              onChange={e => setMessageDraft(e.target.value)}
              disabled={loading}
            />
            {error && (
              <Span color="red.500" fontSize="Caption" mt={2}>
                {error}
              </Span>
            )}
            <Box m="0 auto">
              <StyledButton
                data-cy="EditPublicMessagePopup_SubmitButton"
                buttonSize="small"
                fontWeight="bold"
                px={4}
                mt={3}
                onClick={async () => {
                  await submitMessage({
                    variables: {
                      FromCollectiveId: +fromCollectiveId,
                      CollectiveId: +collectiveId,
                      message: messageDraft ? messageDraft.trim() : null,
                    },
                    // Update cache after mutation
                    update(
                      cache,
                      {
                        data: { editPublicMessage },
                      },
                    ) {
                      // Update Collective contributors
                      try {
                        const collectiveSlug = editPublicMessage[0].collective.slug;
                        const publicMessage = editPublicMessage[0].publicMessage;
                        const variables = {
                          slug: collectiveSlug,
                          nbContributorsPerContributeCard: MAX_CONTRIBUTORS_PER_CONTRIBUTE_CARD,
                        };
                        /** For the update to work you need to deep clone the data
                         * https://github.com/apollographql/apollo-client/issues/3909#issuecomment-522349064
                         */
                        const data = cloneDeep(
                          cache.readQuery({
                            query: getNewCollectivePageQuery,
                            variables,
                          }),
                        );
                        data.Collective.coreContributors = data.Collective.coreContributors.map(contributor =>
                          contributor.id == fromCollectiveId ? { ...contributor, publicMessage } : contributor,
                        );
                        data.Collective.financialContributors = data.Collective.financialContributors.map(contributor =>
                          contributor.id == fromCollectiveId ? { ...contributor, publicMessage } : contributor,
                        );
                        cache.writeQuery({
                          query: getNewCollectivePageQuery,
                          variables,
                          data,
                        });
                      } catch (err) {
                        /** The readQuery method throws if it doesn't find data for the query.
                         * We don't really need to handle that error.
                         */
                      }
                      // Update tier contributors
                      try {
                        const tier = editPublicMessage[0].tier;
                        const publicMessage = editPublicMessage[0].publicMessage;
                        if (tier) {
                          const variables = {
                            tierId: tier.id,
                          };
                          /** For the update to work you need to deep clone the data
                           * https://github.com/apollographql/apollo-client/issues/3909#issuecomment-522349064
                           */
                          const data = cloneDeep(
                            cache.readQuery({
                              query: getTierPageQuery,
                              variables,
                            }),
                          );
                          data.Tier.contributors = data.Tier.contributors.map(contributor =>
                            contributor.id == fromCollectiveId ? { ...contributor, publicMessage } : contributor,
                          );
                          cache.writeQuery({
                            query: getTierPageQuery,
                            variables,
                            data,
                          });
                        }
                      } catch (err) {
                        /** The readQuery method throws if it doesn't find data for the query.
                         * We don't really need to handle that error.
                         */
                      }
                    },
                  });
                  onClose();
                }}
                loading={loading}
              >
                <FormattedMessage id="button.submit" defaultMessage="Submit" />
              </StyledButton>
            </Box>
          </Flex>
        </EditPublicMessagePopupContainer>
      )}
    </Mutation>,
    getRootElem(),
  );
}

EditPublicMessagePopup.defaultProps = {
  message: '',
};

EditPublicMessagePopup.propTypes = {
  fromCollectiveId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  collectiveId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  cardRef: PropTypes.shape({ current: PropTypes.object }).isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string,
  intl: PropTypes.object,
};

export default EditPublicMessagePopup;

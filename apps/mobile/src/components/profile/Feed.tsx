import { LENS_CUSTOM_FILTERS } from '@lenstube/constants'
import {
  type Profile,
  type Publication,
  PublicationMainFocus,
  PublicationTypes,
  useProfilePostsQuery
} from '@lenstube/lens'
import type { FC } from 'react'
import React, { memo, useCallback } from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native'
import Animated from 'react-native-reanimated'

import AudioCard from '../common/AudioCard'
import VideoCard from '../common/VideoCard'

type Props = {
  profile: Profile
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
    flex: 1
  }
})

const Feed: FC<Props> = ({ profile, scrollHandler }) => {
  const { height } = useWindowDimensions()

  const request = {
    publicationTypes: [PublicationTypes.Post],
    limit: 32,
    metadata: {
      mainContentFocus: [PublicationMainFocus.Video, PublicationMainFocus.Audio]
    },
    customFilters: LENS_CUSTOM_FILTERS,
    profileId: profile?.id
  }

  const { data, loading, fetchMore } = useProfilePostsQuery({
    variables: {
      request
    },
    skip: !profile?.id
  })

  const publications = data?.publications?.items as Publication[]
  const pageInfo = data?.publications?.pageInfo

  const fetchMorePublications = async () => {
    await fetchMore({
      variables: {
        request: {
          ...request,
          cursor: pageInfo?.next
        }
      }
    })
  }

  const renderItem = useCallback(
    ({ item }: { item: Publication }) =>
      item.metadata.mainContentFocus === PublicationMainFocus.Audio ? (
        <AudioCard audio={item} />
      ) : (
        <VideoCard video={item} />
      ),
    []
  )

  return (
    <View style={[styles.container, { height }]}>
      <Animated.FlatList
        data={publications}
        renderItem={renderItem}
        keyExtractor={(item, i) => `${item.id}_${i}`}
        ItemSeparatorComponent={() => <View style={{ height: 30 }} />}
        ListFooterComponent={() =>
          loading && <ActivityIndicator style={{ paddingVertical: 20 }} />
        }
        onEndReached={fetchMorePublications}
        onEndReachedThreshold={0.8}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        removeClippedSubviews
        scrollEventThrottle={16}
      />
    </View>
  )
}

export default memo(Feed)
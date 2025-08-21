import type { Component } from '@kitajs/html';
import type * as CSS from 'csstype';
import type { ImportFile } from '../../generated/prisma';
import type { Configuration, MovieListObject, TVListObject } from '../TMDB';

const ellipsisOverflowStyle: CSS.Properties = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

type Props = {
  object: MovieListObject | TVListObject;
  tmdbConfig: Configuration;
  importFile: ImportFile;
};

export const TMDBCard: Component<Props> = ({ object, tmdbConfig, importFile }) => (
  <div class='card'>
    <div class='ratio' style='--bs-aspect-ratio: 150%;'>
      <img
        src={`${tmdbConfig.images.secure_base_url}/w500${object.poster_path}`}
        class='card-img-top text-bg-secondary'
        alt={'title' in object ? object.title : object.name}
      />
    </div>
    <div class='card-img-overlay'>
      <input
        class='form-check-input'
        type='radio'
        name='tmdbMatchId'
        value={object.id.toString()}
        checked={object.id === importFile.tmdbMatchId}
      />
    </div>
    <div class='card-body'>
      <h5
        class='card-title overflow-hidden'
        style={ellipsisOverflowStyle}
        safe
      >{`${object.id}: ${'title' in object ? object.title : object.name}`}</h5>
      <h6 class='card-subtitle mb-2 text-body-secondary' safe>
        {'release_date' in object ? object.release_date : object.first_air_date}
      </h6>
      <p class='card-text overflow-hidden' style={ellipsisOverflowStyle} safe>
        {object.overview}
      </p>
    </div>
  </div>
);

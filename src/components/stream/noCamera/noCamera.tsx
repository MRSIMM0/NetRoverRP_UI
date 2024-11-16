import React from 'react'
import myIcon from '../../../assets/no-video.svg';
import styles from './noCamera.module.scss';

export default function NoCamera() {
  return (
    <section className={styles.wrapper}>
      <img src={myIcon}/>
      <span>No camera connected</span>
    </section>
  )
}

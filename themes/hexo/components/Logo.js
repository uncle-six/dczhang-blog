import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
/**
 * Logo
 * 实际值支持文字
 * 这个代码是为了点击左上文字回到主页
 * @param {*} props
 * @returns
 */
const Logo = props => {
  const { siteInfo } = props
  // return (
  //   <SmartLink href='/' passHref legacyBehavior>
  //     <div className='flex flex-col justify-center items-center cursor-pointer space-y-3'>
  //       <div className='font-medium text-lg p-1.5 rounded dark:border-white dark:text-white menu-link transform duration-200'>
  //         {' '}
  //         {siteInfo?.title || siteConfig('TITLE')}
  //       </div>
  //     </div>
  //   </SmartLink>
  // )
  return (
  <SmartLink href='/' passHref legacyBehavior>
    <div className='flex items-center cursor-pointer space-x-2'>
      {/* Light mode logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/logo-light.png'
        alt={siteInfo?.title || siteConfig('TITLE')}
        className='h-7 w-7 block dark:hidden'
      />

      {/* Dark mode logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/logo-dark.png'
        alt={siteInfo?.title || siteConfig('TITLE')}
        className='h-14 w-14 hidden dark:block'
      />

      <div className='font-medium text-lg rounded dark:border-white dark:text-white menu-link transform duration-200'>
        {siteInfo?.title || siteConfig('TITLE')}
      </div>
    </div>
  </SmartLink>
  )
}
export default Logo

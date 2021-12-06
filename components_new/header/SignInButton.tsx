import React, { Fragment, useState, memo, useRef, FC, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import useTranslation from 'next-translate/useTranslation'
import { XIcon } from '@heroicons/react/outline'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import OtpInput from 'react-otp-input'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useUI } from '@components/ui/context'

import styles from './SignInButton.module.css'
import UserProfileDropDown from './UserProfileDropDown'
import Input from 'react-phone-number-input/input'
import { useRouter } from 'next/router'
import getConfig from 'next/config'
import Image from 'next/image'
import { createPopper } from '@popperjs/core'
import LanguageDropDown from './LanguageDropDown'

axios.defaults.withCredentials = true
const { publicRuntimeConfig } = getConfig()

interface Errors {
  [key: string]: string
}

interface AnyObject {
  [key: string]: any
}

const errors: Errors = {
  name_field_is_required:
    'Мы Вас не нашли в нашей системе. Просьба указать своё имя.',
  opt_code_is_incorrect: 'Введённый код неверный или срок кода истёк',
}

let otpTimerRef: NodeJS.Timeout

const SignInButton: FC = () => {
  const { t: tr } = useTranslation('common')

  let router = useRouter()

  let [isShowPrivacy, setIsShowPrivacy] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isShowPasswordForm, setIsShowPasswordForm] = useState(false)
  const [otpShowCode, setOtpShowCode] = useState(0)
  const [showUserName, setShowUserName] = useState(false)
  const [popoverShow, setPopoverShow] = React.useState(false)
  const btnRef = useRef<any>(null)
  const popoverRef = useRef<any>(null)

  const {
    user,
    setUserData,
    showSignInModal,
    openSignInModal,
    closeSignInModal,
    showOverlay,
    hideOverlay,
  } = useUI()


  const otpTime = useRef(0)

  const openModal = () => {
    openSignInModal()
  }

  const closeModal = () => {
    closeSignInModal()
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState,
    getValues,
    control,
  } = useForm<AnyObject>({
    mode: 'onChange',
  })

  const startTimeout = () => {
    otpTimerRef = setInterval(() => {
      if (otpTime.current > 0) {
        otpTime.current = otpTime.current - 1
        setOtpShowCode(otpTime.current)
      } else {
        clearInterval(otpTimerRef)
      }
    }, 1000)
  }

  const otpTimerText = useMemo(() => {
    let text = 'Получить новый код через '
    const minutes: number = parseInt((otpShowCode / 60).toString(), 0)
    const seconds: number = otpShowCode % 60
    if (minutes > 0) {
      text += minutes + ' мин. '
    }

    if (seconds > 0) {
      text += seconds + ' сек.'
    }
    return text
  }, [otpShowCode])

  const {
    register: passwordFormRegister,
    handleSubmit: handlePasswordSubmit,
    formState: passwordFormState,
  } = useForm({
    mode: 'onChange',
  })
  const onSubmit: SubmitHandler<AnyObject> = async (data) => {
    setSubmitError('')
    const csrfReq = await axios(`${publicRuntimeConfig.apiUrl}/api/keldi`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        crossDomain: true,
      },
      withCredentials: true,
    })
    let { data: res } = csrfReq
    const csrf = Buffer.from(res.result, 'base64').toString('ascii')

    Cookies.set('X-XSRF-TOKEN', csrf)
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
    let ress = await axios.post(
      `${publicRuntimeConfig.apiUrl}/api/send_otp`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    )

    let {
      data: { error: otpError, data: result, success },
    }: {
      data: {
        error: string
        data: AnyObject
        success: any
      }
    } = ress

    if (otpError) {
      setSubmitError(errors[otpError])
      if (otpError == 'name_field_is_required') {
        setShowUserName(true)
      }
    } else if (success) {
      success = Buffer.from(success, 'base64')
      success = success.toString()
      success = JSON.parse(success)
      Cookies.set('opt_token', success.user_token)
      localStorage.setItem('opt_token', success.user_token)
      otpTime.current = result?.time_to_answer
      setOtpShowCode(otpTime.current)
      startTimeout()
      setIsShowPasswordForm(true)
      hideOverlay()
    }
  }

  const submitPasswordForm: SubmitHandler<AnyObject> = async (data) => {
    setSubmitError('')
    const otpToken = Cookies.get('opt_token')
    let ress = await axios.post(
      `${publicRuntimeConfig.apiUrl}/api/auth_otp`,
      {
        phone: authPhone,
        code: otpCode,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${otpToken}`,
        },
        withCredentials: true,
      }
    )

    let {
      data: { result },
    }: { data: { result: any } } = ress
    result = Buffer.from(result, 'base64')
    result = result.toString()
    result = JSON.parse(result)

    if (result === false) {
      setSubmitError(errors.opt_code_is_incorrect)
    } else {
      clearInterval(otpTimerRef)
      setUserData(result)
      setIsShowPasswordForm(false)
      if (router.query && router.query.backUrl) {
        let backUrl: string = router.query.backUrl as string
        router.push(backUrl)
      }
    }
  }

  const authName = watch('name')
  const authPhone = watch('phone')

  const showPrivacy = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    closeSignInModal()
    setIsShowPrivacy(true)
  }

  const closePrivacy = () => {
    setIsShowPrivacy(false)
    openSignInModal()
  }

  let authButtonRef = useRef(null)
  let privacyButtonRef = useRef(null)

  const handleOtpChange = (otp: string) => {
    setOtpCode(otp)
  }

  const getNewCode = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()
    onSubmit({
      name: authName,
      phone: authPhone,
    })
  }

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    }
    newFields[fieldName] = null
    reset(newFields)
  }

  const openPopover = () => {
    showOverlay()
    createPopper(btnRef.current, popoverRef.current, {
      placement: 'bottom'
    })
    setPopoverShow(true)
  }
  const closePopover = () => {
    hideOverlay()
    setPopoverShow(false)
  }

  return (
    <>
      {user && (
        <div>
          <UserProfileDropDown />
        </div>
      )}
      {!user && (
        <>
          <div className="relative hidden md:block">
            <div className="flex flex-wrap">
              <div className="w-full text-center">
                <button
                  className="px-3 py-2 flex focus:outline-none items-center md:bg-gray-100 outline-none rounded-lg border border-grey"
                  type="button"
                  onMouseEnter={() => openPopover()}
                  onMouseLeave={() => closePopover()}
                  ref={btnRef}
                >
                  <Image src="/profile.svg" width="17" height="21" />
                </button>
                <div
                  onMouseEnter={() => openPopover()}
                  onMouseLeave={() => closePopover()}
                  className={
                    (popoverShow ? '' : 'hidden ') +
                    'z-50 transform translate-x-0 inset-x-auto'
                  }
                  ref={popoverRef}
                >
                  <div>
                    <div className="bg-white mt-8 overflow-hidden p-3 rounded-2xl text-center w-max">
                      <LanguageDropDown />
                      <button
                        className="bg-green-500 rounded-xl w-full text-white py-4 mt-5"
                        onClick={() => {
                          openModal()
                        }}
                      >
                        Войти
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Transition appear show={showSignInModal} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-50 overflow-y-auto"
              onClose={closeModal}
              initialFocus={authButtonRef}
            >
              <div className="min-h-screen px-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                  className="inline-block h-screen align-middle"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="align-middle inline-block overflow-hidden w-full">
                    <div className="md:inline-flex my-8 items-start">
                      <div className="align-middle bg-white inline-block overflow-hidden md:px-16 px-6 py-10 rounded-2xl shadow-xl text-center transform transition-all max-w-2xl">
                        <button
                          className="absolute focus:outline-none hidden md:block outline-none right-4 text-gray-500 top-5 transform"
                          onClick={closeModal}
                        >
                          <XIcon className=" cursor-pointer w-4 h-4" />
                        </button>
                        <Dialog.Title as="h3" className="leading-6 text-3xl">
                          {tr('auth')}
                        </Dialog.Title>
                        {submitError && (
                          <div className="bg-red-200 p-5 font-bold text-red-600 my-6">
                            {submitError}
                          </div>
                        )}
                        {user && (
                          <div className="mt-10 bg-green-200 font-bold text-green-800 p-4">
                            {tr('successfully_logged')} {user.user.name}!
                          </div>
                        )}
                        {!user && isShowPasswordForm && (
                          <div>
                            <form
                              onSubmit={handlePasswordSubmit(
                                submitPasswordForm
                              )}
                            >
                              <div className="mt-10">
                                <label className="text-sm text-gray-400 mb-2 block">
                                  {tr('sms_code')}
                                </label>
                                <OtpInput
                                  value={otpCode}
                                  onChange={handleOtpChange}
                                  inputStyle={`${styles.digitField} border border-primary w-16 rounded-3xl h-12 outline-none focus:outline-none text-center`}
                                  isInputNum={true}
                                  containerStyle="grid grid-cols-4 gap-1.5 justify-center"
                                  numInputs={4}
                                />
                                {otpShowCode > 0 ? (
                                  <div className="text-xs text-primary mt-3">
                                    {otpTimerText}
                                  </div>
                                ) : (
                                  <button
                                    className="text-xs text-primary mt-3 outline-none focus:outline-none border-b border-primary pb-0.5"
                                    onClick={(e) => getNewCode(e)}
                                  >
                                    {tr('get_code_again')}
                                  </button>
                                )}
                              </div>
                              <div className="mt-10">
                                <button
                                  className={`py-3 px-20 text-white font-bold text-xl text-center rounded-xl w-full outline-none focus:outline-none ${
                                    otpCode.length >= 4
                                      ? 'bg-primary'
                                      : 'bg-gray-400'
                                  }`}
                                  disabled={otpCode.length < 4}
                                  ref={authButtonRef}
                                >
                                  {passwordFormState.isSubmitting ? (
                                    <svg
                                      className="animate-spin h-5 mx-auto text-center text-white w-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  ) : (
                                    tr('signIn')
                                  )}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}{' '}
                        {!user && !isShowPasswordForm && (
                          <>
                            <form onSubmit={handleSubmit(onSubmit)}>
                              <div className="mt-10">
                                <label className="text-sm text-gray-400 mb-2 block">
                                  {tr('personal_phone')}
                                </label>
                                <div className="relative">
                                  <Controller
                                    render={({
                                      field: { onChange, value },
                                    }) => (
                                      <Input
                                        defaultCountry="UZ"
                                        country="UZ"
                                        international
                                        withCountryCallingCode
                                        value={value}
                                        className="border border-primary focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full"
                                        onChange={(e: any) => onChange(e)}
                                        onKeyDown={(e: any) => {
                                          if (e.key == 'Enter') {
                                            e.preventDefault()
                                            handleSubmit(onSubmit)()
                                          }
                                        }}
                                      />
                                    )}
                                    rules={{
                                      required: true,
                                    }}
                                    key="phone"
                                    name="phone"
                                    control={control}
                                  />
                                  {authPhone && (
                                    <button
                                      className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                                      onClick={() => {
                                        resetField('phone')
                                      }}
                                    >
                                      <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {showUserName && (
                                <div className="mt-10">
                                  <label className="text-sm text-gray-400 mb-2 block">
                                    {tr('your_name')}
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      {...register('name')}
                                      className="border border-primary focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full"
                                    />
                                    {authName && (
                                      <button
                                        className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                                        onClick={() => {
                                          resetField('name')
                                        }}
                                      >
                                        <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="mt-10">
                                <button
                                  className={`py-3 md:px-20 text-white font-bold text-xl text-center rounded-xl w-full outline-none focus:outline-none ${
                                    formState.isValid
                                      ? 'bg-primary'
                                      : 'bg-gray-400'
                                  }`}
                                  disabled={!formState.isValid}
                                  ref={authButtonRef}
                                >
                                  {formState.isSubmitting ? (
                                    <svg
                                      className="animate-spin h-5 mx-auto text-center text-white w-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  ) : (
                                    tr('get_code')
                                  )}
                                </button>
                              </div>
                            </form>
                            {/*<div className="mt-5 text-gray-400 text-sm">
                              Нажимая получить код я принимаю условия{' '}
                              <a
                                href="/privacy"
                                onClick={showPrivacy}
                                className="text-primary block"
                                target="_blank"
                              >
                                пользовательского соглашения
                              </a>
                                </div>*/}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
          <Transition appear show={isShowPrivacy} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-10 overflow-y-auto"
              onClose={closePrivacy}
              initialFocus={privacyButtonRef}
            >
              <div className="min-h-screen px-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                  className="inline-block h-screen align-middle"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="align-middle inline-block overflow-hidden w-full">
                    <div className="inline-flex my-8 items-start">
                      <div className="align-middle bg-white inline-block max-w-4xl overflow-hidden p-10 rounded-2xl shadow-xl text-left transform transition-all w-full">
                        <div className="border-b mb-3 pb-3">
                          <Dialog.Title
                            as="h3"
                            className="leading-6 mb-2 text-2xl"
                          >
                            1. ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ (ОФЕРТА)
                          </Dialog.Title>
                          <p>
                            The standard Lorem Ipsum passage, used since the
                            1500s "Lorem ipsum dolor sit amet, consectetur
                            adipiscing elit, sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua. Ut enim ad minim
                            veniam, quis nostrud exercitation ullamco laboris
                            nisi ut aliquip ex ea commodo consequat. Duis aute
                            irure dolor in reprehenderit in voluptate velit esse
                            cillum dolore eu fugiat nulla pariatur. Excepteur
                            sint occaecat cupidatat non proident, sunt in culpa
                            qui officia deserunt mollit anim id est laborum."
                          </p>
                        </div>
                        <div className="border-b mb-3 pb-3">
                          <Dialog.Title
                            as="h3"
                            className="leading-6 mb-2 text-2xl"
                          >
                            2. Предмет Пользовательского соглашения
                          </Dialog.Title>
                          <p>
                            "Sed ut perspiciatis unde omnis iste natus error sit
                            voluptatem accusantium doloremque laudantium, totam
                            rem aperiam, eaque ipsa quae ab illo inventore
                            veritatis et quasi architecto beatae vitae dicta
                            sunt explicabo. Nemo enim ipsam voluptatem quia
                            voluptas sit aspernatur aut odit aut fugit, sed quia
                            consequuntur magni dolores eos qui ratione
                            voluptatem sequi nesciunt. Neque porro quisquam est,
                            qui dolorem ipsum quia dolor sit amet, consectetur,
                            adipisci velit, sed quia non numquam eius modi
                            tempora incidunt ut labore et dolore magnam aliquam
                            quaerat voluptatem. Ut enim ad minima veniam, quis
                            nostrum exercitationem ullam corporis suscipit
                            laboriosam, nisi ut aliquid ex ea commodi
                            consequatur? Quis autem vel eum iure reprehenderit
                            qui in ea voluptate velit esse quam nihil molestiae
                            consequatur, vel illum qui dolorem eum fugiat quo
                            voluptas nulla pariatur?"
                          </p>
                        </div>
                        <div className="border-b mb-3 pb-3">
                          <Dialog.Title
                            as="h3"
                            className="leading-6 mb-2 text-2xl"
                          >
                            3. Регистрация на Сайте и безопасность
                          </Dialog.Title>
                          <p>
                            "But I must explain to you how all this mistaken
                            idea of denouncing pleasure and praising pain was
                            born and I will give you a complete account of the
                            system, and expound the actual teachings of the
                            great explorer of the truth, the master-builder of
                            human happiness. No one rejects, dislikes, or avoids
                            pleasure itself, because it is pleasure, but because
                            those who do not know how to pursue pleasure
                            rationally encounter consequences that are extremely
                            painful. Nor again is there anyone who loves or
                            pursues or desires to obtain pain of itself, because
                            it is pain, but because occasionally circumstances
                            occur in which toil and pain can procure him some
                            great pleasure. To take a trivial example, which of
                            us ever undertakes laborious physical exercise,
                            except to obtain some advantage from it? But who has
                            any right to find fault with a man who chooses to
                            enjoy a pleasure that has no annoying consequences,
                            or one who avoids a pain that produces no resultant
                            pleasure?"
                          </p>
                        </div>
                        <div className="border-b mb-3 pb-3">
                          <Dialog.Title
                            as="h3"
                            className="leading-6 mb-2 text-2xl"
                          >
                            4. Интеллектуальная собственность и авторское право
                          </Dialog.Title>
                          <p>
                            "At vero eos et accusamus et iusto odio dignissimos
                            ducimus qui blanditiis praesentium voluptatum
                            deleniti atque corrupti quos dolores et quas
                            molestias excepturi sint occaecati cupiditate non
                            provident, similique sunt in culpa qui officia
                            deserunt mollitia animi, id est laborum et dolorum
                            fuga. Et harum quidem rerum facilis est et expedita
                            distinctio. Nam libero tempore, cum soluta nobis est
                            eligendi optio cumque nihil impedit quo minus id
                            quod maxime placeat facere possimus, omnis voluptas
                            assumenda est, omnis dolor repellendus. Temporibus
                            autem quibusdam et aut officiis debitis aut rerum
                            necessitatibus saepe eveniet ut et voluptates
                            repudiandae sint et molestiae non recusandae. Itaque
                            earum rerum hic tenetur a sapiente delectus, ut aut
                            reiciendis voluptatibus maiores alias consequatur
                            aut perferendis doloribus asperiores repellat."
                          </p>
                        </div>
                        <div className="border-b mb-3 pb-3">
                          <Dialog.Title
                            as="h3"
                            className="leading-6 mb-2 text-2xl"
                          >
                            5. Права и обязанности Поверенного
                          </Dialog.Title>
                          <p>
                            "On the other hand, we denounce with righteous
                            indignation and dislike men who are so beguiled and
                            demoralized by the charms of pleasure of the moment,
                            so blinded by desire, that they cannot foresee the
                            pain and trouble that are bound to ensue; and equal
                            blame belongs to those who fail in their duty
                            through weakness of will, which is the same as
                            saying through shrinking from toil and pain. These
                            cases are perfectly simple and easy to distinguish.
                            In a free hour, when our power of choice is
                            untrammelled and when nothing prevents our being
                            able to do what we like best, every pleasure is to
                            be welcomed and every pain avoided. But in certain
                            circumstances and owing to the claims of duty or the
                            obligations of business it will frequently occur
                            that pleasures have to be repudiated and annoyances
                            accepted. The wise man therefore always holds in
                            these matters to this principle of selection: he
                            rejects pleasures to secure other greater pleasures,
                            or else he endures pains to avoid worse pains."
                          </p>
                        </div>
                        <div className="border-b mb-3 pb-3">
                          <Dialog.Title
                            as="h3"
                            className="leading-6 mb-2 text-2xl"
                          >
                            6. Права и обязанности Пользователя
                          </Dialog.Title>
                          <p>
                            "But I must explain to you how all this mistaken
                            idea of denouncing pleasure and praising pain was
                            born and I will give you a complete account of the
                            system, and expound the actual teachings of the
                            great explorer of the truth, the master-builder of
                            human happiness. No one rejects, dislikes, or avoids
                            pleasure itself, because it is pleasure, but because
                            those who do not know how to pursue pleasure
                            rationally encounter consequences that are extremely
                            painful. Nor again is there anyone who loves or
                            pursues or desires to obtain pain of itself, because
                            it is pain, but because occasionally circumstances
                            occur in which toil and pain can procure him some
                            great pleasure. To take a trivial example, which of
                            us ever undertakes laborious physical exercise,
                            except to obtain some advantage from it? But who has
                            any right to find fault with a man who chooses to
                            enjoy a pleasure that has no annoying consequences,
                            or one who avoids a pain that produces no resultant
                            pleasure?"
                          </p>
                        </div>
                      </div>
                      <button
                        className="text-white outline-none focus:outline-none transform"
                        onClick={closePrivacy}
                        ref={privacyButtonRef}
                      >
                        <XIcon className="text-white cursor-pointer w-10 h-10" />
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
    </>
  )
}

export default memo(SignInButton)

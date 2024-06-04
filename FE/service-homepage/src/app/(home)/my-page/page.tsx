'use client';

import { useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import useUserInfoStore from '@/stores/useUserInfoStore';
import { useRouter } from 'next/navigation';
import { postLogout, postVerifyProof } from '@/api/User';
import { useToast } from '@/stores/useToastStore';
import Link from 'next/link';

export default function MyPagePage() {
    const router = useRouter();
    const toastStore = useToast();
    const { userInfo, logout } = useUserInfoStore((state) => state);
    const [proof, setProof] = useState<Object>({});
    const [holderPubKey, setHolderPubKey] = useState<string>('');
    const [issuerPubKey, setIssuerPubKey] = useState<string>(
        'wakeful-cave.testnet'
    );

    const onLogout = async () => {
        logout();
        await postLogout();
        toastStore.openToast('로그아웃 되었습니다.', 'success', () => {
            router.push('/');
        });
    };

    return (
        <main className="flex flex-col items-center justify-center p-24 h-full">
            <h1 className="text-40 mt-24">마이페이지</h1>
            <section className="flex flex-col gap-y-12 mt-80 w-full">
                <ProfileInfo
                    label={'닉네임'}
                    value={userInfo?.nickname as string}
                />
                <ProfileInfo label={'대학교'} value={'부산대학교'} />
                <ProfileInfo
                    label={'2차 인증'}
                    value={
                        userInfo?.isVerifiedUser ? '2차 인증 완료' : '미인증'
                    }
                />

                {/*<div>publicSignals: {JSON.stringify(publicSignals)}</div>*/}
                {/*    {isInstalled ? (*/}
                {/*    <button*/}
                {/*        className={*/}
                {/*            'p-2 bg-black text-white rounded-2xl ml-auto'*/}
                {/*        }*/}
                {/*        onClick={onConnectWallet}*/}
                {/*    >*/}
                {/*        2차 인증 하러가기*/}
                {/*    </button>*/}
                {/*) : (*/}
                {/*    <button*/}
                {/*        className={'p-2 bg-gray-200 rounded-2xl ml-auto'}*/}
                {/*        onClick={onInstallWallet}*/}
                {/*    >*/}
                {/*        지갑 설치하기*/}
                {/*    </button>*/}
                {/*)}*/}
            </section>
            {!userInfo?.isVerifiedUser && (
                <section
                    id={'2nd-auth-banner'}
                    className=" flex flex-col gap-y-12 mt-56 w-full border-2 bg-indigo-500 rounded-8 p-12 text-white"
                >
                    <h2 className="text-24">2차 인증</h2>
                    <div className="flex w-full gap-x-8">
                        <p>
                            짝사랑 종이배 만의 블록체인과 암호학 기반의 인증
                            로직으로 2차 인증을 수행해보세요!
                        </p>
                    </div>
                    <div className={'flex w-full gap-x-8'}>
                        <p
                            className={
                                'font-bold text-red-300 flex items-center gap-x-4'
                            }
                        >
                            +10 <FaHeart />
                        </p>
                        <Link
                            href={'/my-page/verify-proof'}
                            className={
                                'p-2 underline text-white font-bold ml-auto'
                            }
                        >
                            2차 인증 하러가기
                        </Link>
                    </div>
                </section>
            )}
            <button
                className={'px-8 py-4 bg-gray-200 rounded-8 mt-48 ml-auto'}
                onClick={onLogout}
            >
                로그아웃
            </button>
        </main>
    );
}

function ProfileInfo({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex w-full items-center justify-between">
            <span className="text-lg text-gray-400">{label}</span>
            <span className="text-lg">{value}</span>
        </div>
    );
}

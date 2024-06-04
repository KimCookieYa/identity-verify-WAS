'use client';

import { FaEye } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import useUserInfoStore from '@/stores/useUserInfoStore';
import { useModalStore } from '@/stores/useModalStore';
import { useToast } from '@/stores/useToastStore';
import { postVerifyProof } from '@/api/User';
import { useRouter } from 'next/navigation';
import { useProofStore } from '@/stores/useProofStore';

export default function VerifyProofPage() {
    const router = useRouter();
    const { openToast } = useToast();
    const { openModal } = useModalStore();
    const proofStore = useProofStore();
    const { userInfo, logout } = useUserInfoStore((state) => state);

    useEffect(() => {
        setTimeout(() => {
            const element = document.getElementById(
                process.env.NEXT_PUBLIC_WALLET_EXTENSION_ID as string
            );
            if (element) {
                console.log('wallet is installed');
            } else {
                console.log("wallet isn't installed");
            }
        }, 1000);
    }, []);

    const onInstallWallet = () => {
        alert('크롬 웹스토어로 이동합니다!');
    };

    useEffect(() => {
        // 확장 앱으로부터 메시지를 받기 위한 이벤트 리스너
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'FROM_EXTENSION_TO_PAGE') {
                console.log('Message from the extension:', event.data.message);
                const data = JSON.parse(event.data.message);
                openToast('증명을 가져왔습니다!', 'success', () => {});
                proofStore.setProof(data.proof);
                proofStore.setHolderPubKey(data.holderPubKey);
                proofStore.setIssuerPubKey('wakeful-cave.testnet');
                // setIssuerPubKey(data.issuerPubKey);
                //setPublicSignals(data.publicSignals);
            }
        });
    }, []);

    // 버튼 클릭시 메시지 보내기
    const sendMessageToExtension = () => {
        window.postMessage(
            { type: 'FROM_PAGE', text: 'Hello, extension!' },
            '*'
        );
    };

    const onConnectWallet = () => {
        alert('지갑 연결!');
        sendMessageToExtension();
    };

    const onVerifyProof = async () => {
        const res = await postVerifyProof(
            process.env.NEXT_PUBLIC_SERVICE_NAME as string,
            proofStore?.proof,
            proofStore?.issuerPubKey
        );
        if (res.data.result <= 300) {
            console.log(res.data.data);
            openToast('2차 인증 완료!', 'success', () => {
                router.push('/my-page');
            });
        } else {
            console.log(res.data);
            openToast(res.data?.message, 'error', () => {});
        }
    };

    return (
        <main className="flex flex-col items-center p-12 h-full font-sans">
            <h1 className="text-40 mt-100">2차 인증하기</h1>
            <p className="text-20 mt-8">당신의 증명을 검증해주세요!</p>
            <div className={'flex flex-col gap-y-8 mt-56 border-1 px-16 py-8'}>
                <p>1. 크롬 확장앱, 노모어왈렛을 설치하세요!</p>
                <p>2. 지갑을 따라 당신만의 증명을 생성하세요!</p>
                <p>3. 증명을 가져오고 당신의 학교를 검증해보세요!</p>
            </div>
            <section className="flex flex-col gap-y-12 mt-80 w-full">
                <div className={'flex w-full'}>
                    <p>인증기관</p>
                    <select className="p-2 border border-gray-300 rounded-8 ml-auto">
                        <option value="pnu">부산대학교</option>
                        <option value="donga">동아대학교</option>
                        <option value="pknu">부경대학교</option>
                    </select>
                </div>
                <div className={'flex w-full'}>
                    <p>증거</p>
                    <FaEye
                        className={'ml-auto cursor-pointer'}
                        onClick={() => {
                            openModal(
                                <DataModal
                                    data={JSON.stringify(
                                        proofStore?.proof,
                                        null,
                                        2
                                    )}
                                />
                            );
                        }}
                    />
                </div>
                <div className={'flex w-full'}>
                    <p>나의 공개키</p>
                    <FaEye
                        className={'ml-auto'}
                        onClick={() =>
                            openModal(
                                <DataModal data={proofStore?.holderPubKey} />
                            )
                        }
                    />
                </div>
                <div className={'flex w-full'}>
                    <p>부산대학교 Near 계정</p>
                    <FaEye
                        className={'ml-auto'}
                        onClick={() =>
                            openModal(
                                <DataModal data={proofStore?.issuerPubKey} />
                            )
                        }
                    />
                </div>
            </section>
            <button
                className={
                    'w-full h-48 bg-secondary text-white text-20 rounded-12 mt-24 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed'
                }
                onClick={onVerifyProof}
            >
                2차 인증하기
            </button>
        </main>
    );
}

function DataModal({ data }: { data: string }) {
    return (
        <article
            className={
                'fixed top-0 left-0 right-0 bottom-0 flex flex-col m-auto w-260 h-300 bg-white rounded-20 p-24 z-[9999999] overflow-y-scroll text-18'
            }
        >
            {data}
        </article>
    );
}

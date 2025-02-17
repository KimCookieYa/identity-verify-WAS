/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UserVCDto } from '../dto/user-vc.dto';
import { connectToNEARContract, createVC } from '../utils/utils';
import { NEARContract } from '../types/types';
import * as ed25519 from '@stablelib/ed25519';
import { InjectRepository } from '@nestjs/typeorm';
import { CounterEntity } from '../entity/counter.entity';
import { Repository } from 'typeorm';
import { CustomLoggerService } from '../module/custom.logger';
import { CustomErrorException } from '../filter/custom-error.exception';
const bs58 = require('bs58');
const bcrypt = require('bcryptjs');

@Injectable()
export class IssuerAPIService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CounterEntity)
    private counterRepository: Repository<CounterEntity>,
    private readonly customLoggerService: CustomLoggerService,
  ) {}

  ISSUER_PUB_KEY = this.configService.get<string>('ISSUER_PUB_KEY');
  ISSUER_PRI_KEY = this.configService.get<string>('ISSUER_PRI_KEY');

  /*
    @ Use: Issuer Controller - createUserVC()
    @ Intend: did 규격에 맞게 VC object 생성
  */
  async createUserVC(dto: UserVCDto) {
    const { holderPubKey } = dto;
    const uuid = uuidv4();

    // proof value가 삽입된 VC 생성
    const { proofValue, message } = await this.generateProofValue();

    const vc = createVC(uuid, holderPubKey, proofValue);
    return { uuid, vc, message };
  }

  /*
    @ Use: Issuer Controller - createUserVC()
    @ Intend: hash한 VC를 Near 네트워크에 적재
  */
  async loadKeyChain(issuerPubKey: string, vc: string) {
    const contract = await connectToNEARContract();

    // { Issuer Pub Key : Hash(VC) } 적재
    const hashVC = await bcrypt.hash(vc, 10);

    await (contract as NEARContract).load_hashed_vc({
      issuer_did: `did:near:${issuerPubKey}`,
      hashed_vc: hashVC,
    });

    // 제대로 적재 되었는지 확인
    const response = await (contract as NEARContract).get_hashed_vcs({
      issuer_did: `did:near:${issuerPubKey}`,
    });

    console.log(`[+] hashed VCs from issuer '${issuerPubKey}': ${response}`);
    return response;
  }

  /*
    @ Use: createUserVC()
    @ Intend: VC에 sign하기 위해 Issuer Pri Key로 sign한 값을 반환
    * Info: Key는 일단 env 파일로 관리
  */
  async generateProofValue() {
    // Issuer Key Pair 생성
    // => Public Key: 32자리 base58 / Private Key: 64자리 base58

    // VC sign 목적 proofValue 생성
    // Private Key로 msg를 sign함
    // => Proof Value: 64자리 base58
    const thisCount = await this.getCountAndIncrement();
    const message = `VC_no_${thisCount}`;
    return {
      proofValue: bs58.encode(
        ed25519.sign(bs58.decode(this.ISSUER_PRI_KEY), Buffer.from(message)),
      ),
      message,
    };
  }

  /*
    @ Use: Issuer Controller - createUserVC()
    @ Intend: Issuer Pub Key를 반환
  */
  getIssuerPubKey() {
    return 'wakeful-cave.testnet';
  }

  /*
    @ Use: main.ts (환경변수)
    @ Intend: Counter를 초기화
  */
  async resetCounter() {
    return await this.counterRepository.save({ id: 'counter', count: 0 });
  }

  /*
    @ Use: generateProofValue()
    @ Intend: Counter를 통해 현재 count 값을 반환
  */
  async getCountAndIncrement() {
    try {
      const countRow = await this.counterRepository.findOne({
        where: { id: 'counter' },
      });
      if (!countRow) {
        await this.counterRepository.save({ id: 'counter', count: 1 });
        return 1;
      }
      countRow.count += 1;
      await this.counterRepository.save(countRow);

      return countRow.count;
    } catch (error) {
      this.customLoggerService.error(
        '/generate-proof-value',
        'count 자동 증가 실패',
        {},
      );
      throw new CustomErrorException('Auto Increment Count Failed', 500);
    }
  }

  /*
    @ Use: Issuer Controller - checkIsLoadedDID()
    @ Intend: 등록된 DID가 맞는지 확인
  */
  async checkIsLoadedDID(): Promise<string[]> {
    const contract = await connectToNEARContract();
    const response: string[] = await (contract as NEARContract).get_total_did(
      {},
    );
    return response;
  }
}

import config from 'config';
import utils from '../zkp-utils';

const { leftPadHex } = utils;
const LEAF_HASHLENGTH = config.get('LEAF_HASHLENGTH');

// test data.
export default {
  alice: {
    name: 'alice',
    email: 'alice@ey.com',
    password: 'pass',
    get pk() {
      return this.secretKey === undefined ? undefined : utils.hash(this.secretKey); // secretKey - set at login test suit (step 2)
    },
  },
  bob: {
    name: 'bob',
    email: 'bob@ey.com',
    password: 'pass',
    get pk() {
      return this.secretKey === undefined ? undefined : utils.hash(this.secretKey); // secretKey - set at login test suit (step 2)
    },
  },
  erc721: {
    tokenUri: 'one',
  },
  erc20: {
    mint: 5,
    toBeMintedAsCommitment: [2, 3],
    transfer: 4,
    get change() {
      return this.toBeMintedAsCommitment.reduce((a, b) => a + b, -this.transfer);
    },
  },

  // dependent data
  async erc721Commitment() {
    const { alice, bob, erc721 } = this;
    return {
      tokenUri: erc721.tokenUri,
      get tokenId() {
        return erc721.tokenId;
      },
      mintCommitmentIndex: 0,
      transferCommitmentIndex: 1,

      // commitment while mint
      get mintCommitment() {
        return utils.concatenateThenHash(
          `0x${utils.strip0x(this.address).padStart(64, '0')}`,
          utils.strip0x(this.tokenId).slice(-(LEAF_HASHLENGTH * 2)),
          alice.pk,
          this.salt, // salt - set at erc-721 commitment mint (step 4)
        );
      },

      // commitment while transfer
      get transferCommitment() {
        return utils.concatenateThenHash(
          `0x${utils.strip0x(this.address).padStart(64, '0')}`,
          utils.strip0x(this.tokenId).slice(-(LEAF_HASHLENGTH * 2)),
          bob.pk,
          this.transferredSalt, // S_B - set at erc-721 commitment transfer to bob (step 5)
        );
      },
    };
  },

  // dependent data
  async erc20Commitments() {
    const { alice, bob, erc20 } = this;

    return {
      mint: [
        {
          value: leftPadHex(erc20.toBeMintedAsCommitment[0], 32),
          commitmentIndex: 0,
          get commitment() {
            return utils.concatenateThenHash(
              this.value,
              alice.pk,
              this.salt === undefined ? '0x0' : this.salt, // salt - set at erc-20 commitment mint (step 10)
            );
          },
        },
        {
          value: leftPadHex(erc20.toBeMintedAsCommitment[1], 32),
          commitmentIndex: 1,
          get commitment() {
            return utils.concatenateThenHash(
              this.value,
              alice.pk,
              this.salt === undefined ? '0x0' : this.salt, // S_A - set at erc-20 commitment mint (step 11)
            );
          },
        },
      ],
      transfer: {
        value: leftPadHex(erc20.transfer, 32),
        commitmentIndex: 2,
        get commitment() {
          return utils.concatenateThenHash(
            this.value,
            bob.pk,
            this.salt === undefined ? '0x0' : this.salt, // S_E - set at erc-20 commitment transfer (step 12)
          );
        },
      },
      change: {
        value: leftPadHex(erc20.change, 32),
        commitmentIndex: 3,
        get commitment() {
          return utils.concatenateThenHash(
            this.value,
            alice.pk,
            this.salt === undefined ? '0x0' : this.salt, // S_F - set at erc-20 commitment transfer (step 12)
          );
        },
      },
    };
  },

  async erc20CommitmentBatchTransfer() {
    const { alice, bob } = this;
    return {
      mint: 40,
      get value() {
        return leftPadHex(parseInt(this.mint, 7), 32);
      },
      get commitment() {
        return utils.concatenateThenHash(
          this.value,
          alice.pk,
          this.salt === undefined ? '0x0' : this.salt, // S_A - set at erc-20 commitment mint (step 18)
        );
      },
      commitmentIndex: 4,
      transferData: [
        {
          value: '0x00000000000000000000000000000002',
          receiver: { name: bob.name },
          commitmentIndex: 5,
          get commitment() {
            return utils.concatenateThenHash(
              this.value,
              bob.pk,
              this.salt === undefined ? '0x0' : this.salt, // salt - set at erc-20 commitment mint (step 18)
            );
          },
        },
        {
          value: '0x00000000000000000000000000000002',
          receiver: { name: alice.name },
          commitmentIndex: 6,
          get commitment() {
            return utils.concatenateThenHash(
              this.value,
              alice.pk,
              this.salt === undefined ? '0x0' : this.salt, // salt - set at erc-20 commitment mint (step 18)
            );
          },
        },
      ],
    };
  },

  /*
   *  This function will configure dependent test data.
   */
  async configureDependentTestData() {
    this.erc721Commitment = await this.erc721Commitment();
    this.erc20Commitments = await this.erc20Commitments();
    this.erc20CommitmentBatchTransfer = await this.erc20CommitmentBatchTransfer();
  },
};

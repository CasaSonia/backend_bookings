import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Suit } from '../entity/suit.entity';
import { Repository } from 'typeorm';
import { CreateSuitDto } from '../dto/create-suit.dto';
import { UpdateSuitDto } from '../dto/update-suit.dto';
import { SuitState } from 'src/utils/suit_utils';
@Injectable()
export class SuitService {
  constructor(
    @InjectRepository(Suit) private suitRepository: Repository<Suit>,
  ) {}
  getSuits() {
    return this.suitRepository.find({
      relations: {
        bookings: true,
      },
    });
  }

  async createSuit(suit: CreateSuitDto) {
    const suitFound = await this.suitRepository.findOne({
      where: { id: suit.id },
    });
    if (suitFound)
      throw new HttpException('Suit already exists', HttpStatus.CONFLICT);
    const newSuit = this.suitRepository.create(suit);
    return this.suitRepository.save(newSuit);
  }

  async getSuit(id: string) {
    const suitFound = await this.suitRepository.findOne({ where: { id } });
    if (!suitFound) {
      throw new HttpException('Suit not found', HttpStatus.NOT_FOUND);
    }
    return suitFound;
  }

  async deleteSuit(id: string) {
    const suitFound = await this.suitRepository.findOne({
      where: { id },
      relations: ['bookings'],
    });
    if (!suitFound) {
      throw new HttpException('Suit not found', HttpStatus.NOT_FOUND);
    }
    const active_bookings = suitFound.bookings.filter(
      (booking) =>
        booking.booking_state === 'ACTIVED' ||
        booking.booking_state === 'INPROGRESS',
    );
    if (active_bookings.length > 0) {
      throw new HttpException(
        'Suit has active bookings',
        HttpStatus.BAD_REQUEST,
      );
    }
    const res = await this.suitRepository.remove(suitFound);
    if (!res) {
      throw new HttpException(
        'Error deleting suit',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return {
      message: 'Suit Deleted successfully',
    };
  }
  async updateSuit(id: string, suit: UpdateSuitDto) {
    const suitFound = await this.suitRepository.findOne({ where: { id } });
    if (!suitFound) {
      throw new HttpException('Suit not found', HttpStatus.NOT_FOUND);
    }
    Object.assign(suitFound, suit);
    try {
      return await this.suitRepository.save(suitFound);
    } catch (e) {
      throw new HttpException('Error updating suit', HttpStatus.BAD_REQUEST);
    }
  }

  async getSuitToLoundry() {
    const suitsToLoundry = await this.suitRepository.find({
      where: { state: SuitState.ENLOCALSUCIO },
    });
    if (suitsToLoundry.length > 0) {
      return suitsToLoundry;
    } else {
      return [];
    }
  }

  async getSuitToTakeLoundry() {
    const suitsToTakeLoundry = await this.suitRepository.find({
      where: { state: SuitState.LAVANDERIALIMPIO },
    });
    if (suitsToTakeLoundry.length > 0) {
      return suitsToTakeLoundry;
    } else {
      return [];
    }
  }
  async getSuitsInLoundry() {
    const suitsInLoundry = await this.suitRepository.find({
      where: { state: SuitState.LAVANDERIASUCIO },
    });
    if (suitsInLoundry.length > 0) {
      return suitsInLoundry;
    } else {
      return [];
    }
  }
}
